import re
import uuid
from typing import Dict, Any, Optional
from sqlmodel import Session, select

from app.domain.models.land_gov import LandParcel, DisputeCase, IngestionBatch
from app.domain.services.ingestion.base_connector import BaseStateConnector


class DocumentIngestionAdapter:
    """
    Ingests unstructured/semi-structured text extracted from PDF court orders,
    gazette notifications, and revenue mutation rulings.
    Extracts case numbers, Khasra references, risk levels, and links to parcels.
    """

    def __init__(self, connector: Optional[BaseStateConnector] = None):
        self.connector = connector

    def parse_and_ingest_order_text(
        self,
        text: str,
        session: Session,
        document_filename: str = "court_order.pdf",
        court_type: str = "Revenue Court (SDM)",
        district: str = "South Delhi",
        source_system: str = "PDF_COURT_ORDER_PARSER",
        provenance_type: str = "CURATED"
    ) -> Dict[str, Any]:
        """
        Parses text extracted from a legal order or gazette and creates a linked DisputeCase.
        """
        batch_id = f"BATCH-DOC-{uuid.uuid4().hex[:8].upper()}"

        # 1. Regex heuristics for typical Indian Revenue / Civil court orders
        case_match = re.search(r"(?:Case\s*(?:No\.?|Number)|C\.?P\.?|REV|CIV|MUT)[\s/:-]*([A-Z0-9/_-]+)", text, re.IGNORECASE)
        case_number = case_match.group(1).strip() if case_match else f"DOC/{uuid.uuid4().hex[:6].upper()}/DL"

        khasra_match = re.search(r"(?:Khasra|Survey|Plot)[\s*(?:No\.?|Number)]*[\s/:-]*([0-9]+(?:/[0-9]+[A-Za-z]*)?)", text, re.IGNORECASE)
        khasra_no = khasra_match.group(1).strip() if khasra_match else None

        title_match = re.search(r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:versus|vs\.?|v/s)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)", text, re.IGNORECASE)
        if title_match:
            plaintiff = title_match.group(1).strip()
            defendant = title_match.group(2).strip()
            title = f"{plaintiff} vs {defendant}"
        else:
            plaintiff = "Applicant / Petitioner"
            defendant = "Respondent / State"
            title = f"Revenue Case regarding {khasra_no or 'Land Parcel'}"

        # Risk assessment heuristics
        risk_level = "Medium"
        if any(w in text.lower() for w in ["encroachment", "forgery", "ridge", "gram sabha", "contempt", "quash"]):
            risk_level = "High"
        if any(w in text.lower() for w in ["critical", "demolition", "stay order", "injunction"]):
            risk_level = "Critical"

        # Check existing
        existing = session.exec(select(DisputeCase).where(DisputeCase.case_number == case_number)).first()
        if existing:
            return {
                "success": False,
                "batch_id": batch_id,
                "case_number": case_number,
                "error": f"Case number '{case_number}' already exists in the system."
            }

        # Look up parcel
        matched_parcel = None
        if khasra_no:
            matched_parcel = session.exec(select(LandParcel).where(LandParcel.khasra_no == khasra_no)).first()

        dispute = DisputeCase(
            case_number=case_number,
            khasra_no=khasra_no or "UNRESOLVED",
            district=district,
            state="Delhi",
            court_type=court_type,
            title=title,
            description=f"Extracted from document '{document_filename}': {text[:250]}...",
            dispute_category="Boundary Encroachment" if "boundary" in text.lower() else "Title Contestation",
            status="Active",
            filing_date="2026-02-01",
            next_hearing_date="2026-10-20",
            estimated_value_lakhs=75.0,
            plaintiff=plaintiff,
            defendant=defendant,
            risk_level=risk_level,
            parcel_id=matched_parcel.id if matched_parcel else None,
            ulpin=matched_parcel.ulpin if matched_parcel else None,
            source_system=source_system,
            source_record_id=document_filename,
            provenance_type=provenance_type
        )
        session.add(dispute)

        batch = IngestionBatch(
            batch_id=batch_id,
            source_state="DL",
            source_system=source_system,
            filename=document_filename,
            records_total=1,
            records_ingested=1,
            records_failed=0,
            provenance_type=provenance_type,
            status="COMPLETED"
        )
        session.add(batch)
        session.commit()

        return {
            "success": True,
            "batch_id": batch_id,
            "case_number": case_number,
            "khasra_no": khasra_no,
            "linked_parcel_id": matched_parcel.id if matched_parcel else None,
            "risk_level": risk_level,
            "title": title
        }
