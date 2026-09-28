import io
import csv
import json
import uuid
from typing import Dict, Any, List, Optional
from sqlmodel import Session, select

from app.domain.models.land_gov import LandParcel, DisputeCase, IngestionBatch
from app.domain.services.ingestion.delhi_connector import DelhiConnector


class StructuredLandRecordAdapter:
    """
    Adapter for tabular CSV/JSON ingestion of Cadastral Land Records & Legal Dispute Dockets.
    """

    def __init__(self, connector: Optional[DelhiConnector] = None):
        self.connector = connector or DelhiConnector()

    def ingest_parcels_csv(
        self,
        csv_text: str,
        session: Session,
        batch_id: Optional[str] = None,
        source_system: str = "DORIS_CSV_IMPORT",
        provenance_type: str = "CURATED"
    ) -> Dict[str, Any]:
        """Ingest a CSV string of land records into LandParcel table."""
        if not batch_id:
            batch_id = f"BATCH-CSV-{uuid.uuid4().hex[:8].upper()}"

        reader = csv.DictReader(io.StringIO(csv_text.strip()))
        rows = list(reader)

        if not rows:
            return {"success": False, "batch_id": batch_id, "error": "CSV file contains no data rows."}

        records_total = len(rows)
        records_ingested = 0
        records_failed = 0
        errors: List[Dict[str, Any]] = []

        batch = IngestionBatch(
            batch_id=batch_id,
            source_state=self.connector.state_code,
            source_system=source_system,
            records_total=records_total,
            provenance_type=provenance_type
        )
        session.add(batch)

        existing_keys = set(
            session.exec(select(LandParcel.khasra_no, LandParcel.district)).all()
        )

        for idx, row in enumerate(rows):
            try:
                row["source_system"] = source_system
                norm = self.connector.normalize_record(row, provenance_type=provenance_type)

                # Coordinate bounds validation
                if not self.connector.validate_bounds(norm["lat"], norm["lng"]):
                    records_failed += 1
                    errors.append({
                        "row": idx + 1,
                        "khasra_no": norm["khasra_no"],
                        "reason": f"Coordinates ({norm['lat']}, {norm['lng']}) out of bounds."
                    })
                    continue

                # Duplicate detection
                key = (norm["khasra_no"], norm["district"])
                if key in existing_keys:
                    records_failed += 1
                    errors.append({
                        "row": idx + 1,
                        "khasra_no": norm["khasra_no"],
                        "reason": f"Duplicate parcel for Khasra {norm['khasra_no']} in {norm['district']}."
                    })
                    continue

                parcel = LandParcel(**norm)
                session.add(parcel)
                existing_keys.add(key)
                records_ingested += 1

            except Exception as e:
                records_failed += 1
                errors.append({"row": idx + 1, "reason": str(e)})

        try:
            batch.records_ingested = records_ingested
            batch.records_failed = records_failed
            batch.status = "COMPLETED" if records_failed == 0 else ("PARTIAL" if records_ingested > 0 else "FAILED")
            if errors:
                batch.errors_json = json.dumps(errors[:50])
            session.commit()
        except Exception as e:
            session.rollback()
            return {"success": False, "batch_id": batch_id, "error": f"Database commit failed: {str(e)}"}

        return {
            "success": records_ingested > 0,
            "batch_id": batch_id,
            "records_total": records_total,
            "records_ingested": records_ingested,
            "records_failed": records_failed,
            "errors": errors[:20]
        }

    def ingest_disputes_json(
        self,
        disputes_data: List[Dict[str, Any]],
        session: Session,
        batch_id: Optional[str] = None,
        source_system: str = "DELHI_ECOURTS_SYNC",
        provenance_type: str = "CURATED"
    ) -> Dict[str, Any]:
        """
        Ingest dispute records from legal or revenue portals.
        Automatically links to underlying LandParcel via Khasra No / ULPIN.
        """
        if not batch_id:
            batch_id = f"BATCH-DISP-{uuid.uuid4().hex[:8].upper()}"

        if not isinstance(disputes_data, list) or len(disputes_data) == 0:
            return {"success": False, "batch_id": batch_id, "error": "Disputes payload must be a non-empty list of case objects."}

        records_total = len(disputes_data)
        records_ingested = 0
        records_failed = 0
        errors: List[Dict[str, Any]] = []

        batch = IngestionBatch(
            batch_id=batch_id,
            source_state="DL",
            source_system=source_system,
            records_total=records_total,
            provenance_type=provenance_type
        )
        session.add(batch)

        # Build lookup for parcels by khasra
        parcels = session.exec(select(LandParcel)).all()
        parcel_khasra_map = {p.khasra_no: p for p in parcels}

        existing_case_nums = set(
            session.exec(select(DisputeCase.case_number)).all()
        )

        for idx, item in enumerate(disputes_data):
            try:
                case_num = item.get("case_number")
                if not case_num:
                    records_failed += 1
                    errors.append({"record_index": idx, "reason": "Missing required field 'case_number'."})
                    continue

                if case_num in existing_case_nums:
                    records_failed += 1
                    errors.append({"record_index": idx, "case_number": case_num, "reason": "Duplicate case number."})
                    continue

                khasra = item.get("khasra_no")
                matched_parcel = parcel_khasra_map.get(khasra)

                dispute = DisputeCase(
                    case_number=case_num,
                    khasra_no=khasra or "UNKNOWN",
                    district=item.get("district", "South Delhi"),
                    state=item.get("state", "Delhi"),
                    court_type=item.get("court_type", "Revenue Court (SDM)"),
                    title=item.get("title", f"Dispute on Khasra {khasra}"),
                    description=item.get("description", "Land contestation regarding boundaries or rights."),
                    dispute_category=item.get("dispute_category", "Boundary Encroachment"),
                    status=item.get("status", "Active"),
                    filing_date=item.get("filing_date", "2026-01-01"),
                    next_hearing_date=item.get("next_hearing_date"),
                    estimated_value_lakhs=float(item.get("estimated_value_lakhs", 50.0)),
                    plaintiff=self.connector.sanitize_pii(item.get("plaintiff", "Public Complainant")),
                    defendant=self.connector.sanitize_pii(item.get("defendant", "Private Respondent")),
                    risk_level=item.get("risk_level", "Medium"),
                    parcel_id=matched_parcel.id if matched_parcel else None,
                    ulpin=matched_parcel.ulpin if matched_parcel else item.get("ulpin"),
                    source_system=source_system,
                    source_record_id=item.get("source_record_id") or case_num,
                    provenance_type=provenance_type
                )
                session.add(dispute)
                existing_case_nums.add(case_num)
                records_ingested += 1

            except Exception as e:
                records_failed += 1
                errors.append({"record_index": idx, "reason": str(e)})

        try:
            batch.records_ingested = records_ingested
            batch.records_failed = records_failed
            batch.status = "COMPLETED" if records_failed == 0 else ("PARTIAL" if records_ingested > 0 else "FAILED")
            if errors:
                batch.errors_json = json.dumps(errors[:50])
            session.commit()
        except Exception as e:
            session.rollback()
            return {"success": False, "batch_id": batch_id, "error": f"Database commit failed: {str(e)}"}

        return {
            "success": records_ingested > 0,
            "batch_id": batch_id,
            "records_total": records_total,
            "records_ingested": records_ingested,
            "records_failed": records_failed,
            "linked_to_parcels_count": sum(1 for d in disputes_data if d.get("khasra_no") in parcel_khasra_map),
            "errors": errors[:20]
        }
