from typing import Dict, Any, List, Optional
from sqlmodel import Session, select

from app.domain.models.land_gov import LandParcel, DisputeCase, AdministrativeUnit, IngestionBatch


class CanonicalService:
    """
    Core Domain Service providing:
    1. Canonical Jurisdiction-Neutral Hierarchy (State -> District -> Tehsil -> Village -> Parcel)
    2. End-to-end Traceability: Parcel -> Administration -> Dispute Cases
    3. Multi-source Provenance and Data Quality Audits
    """

    @staticmethod
    def trace_parcel(
        identifier: str,
        session: Session
    ) -> Optional[Dict[str, Any]]:
        """
        Trace a parcel to its administrative parent units and linked legal dispute cases.
        Matches by integer parcel ID, 14-char ULPIN, or Khasra No.
        """
        parcel = None
        # Try by integer ID
        if identifier.isdigit():
            parcel = session.get(LandParcel, int(identifier))

        # Try by ULPIN
        if not parcel:
            parcel = session.exec(select(LandParcel).where(LandParcel.ulpin == identifier)).first()

        # Try by Khasra No
        if not parcel:
            parcel = session.exec(select(LandParcel).where(LandParcel.khasra_no == identifier)).first()

        if not parcel:
            return None

        # 1. Resolve Administrative Chain (Village -> Tehsil -> District -> State)
        district_unit = session.exec(
            select(AdministrativeUnit).where(
                AdministrativeUnit.unit_type == "DISTRICT",
                AdministrativeUnit.name.like(f"%{parcel.district.replace(' Delhi', '')}%")
            )
        ).first()

        village_unit = session.exec(
            select(AdministrativeUnit).where(
                AdministrativeUnit.name.like(f"%{parcel.village}%")
            )
        ).first()

        tehsil_unit = session.exec(
            select(AdministrativeUnit).where(
                AdministrativeUnit.unit_type == "TEHSIL",
                AdministrativeUnit.name.like(f"%{parcel.taluka}%")
            )
        ).first()

        state_unit = session.exec(
            select(AdministrativeUnit).where(AdministrativeUnit.unit_type == "STATE")
        ).first()

        # 2. Resolve Linked Dispute Cases
        disputes = session.exec(
            select(DisputeCase).where(
                (DisputeCase.parcel_id == parcel.id) |
                (DisputeCase.khasra_no == parcel.khasra_no) |
                ((DisputeCase.ulpin == parcel.ulpin) & (DisputeCase.ulpin.is_not(None)))
            )
        ).all()

        return {
            "parcel": {
                "id": parcel.id,
                "khasra_no": parcel.khasra_no,
                "ulpin": parcel.ulpin,
                "area_acres": parcel.area_acres,
                "land_use": parcel.land_use,
                "owner_name": parcel.owner_name,
                "title_status": parcel.title_status,
                "svamitva_issued": parcel.svamitva_issued,
                "lat": parcel.lat,
                "lng": parcel.lng,
                "dispute_risk_score": parcel.dispute_risk_score,
                "climate_vulnerability_index": parcel.climate_vulnerability_index,
                "is_digitized": parcel.is_digitized,
                "is_resolved": parcel.is_resolved,
                "geojson_polygon": parcel.geojson_polygon,
            },
            "administrative_hierarchy": {
                "state": {
                    "code": state_unit.code if state_unit else "DL",
                    "name": state_unit.name if state_unit else "NCT of Delhi",
                    "unit_type": "STATE"
                },
                "district": {
                    "code": district_unit.code if district_unit else f"DL-DIST-{parcel.district.upper().replace(' ', '')}",
                    "name": district_unit.name if district_unit else parcel.district,
                    "unit_type": "DISTRICT"
                },
                "tehsil": {
                    "code": tehsil_unit.code if tehsil_unit else f"DL-TEH-{parcel.taluka.upper().replace(' ', '')}",
                    "name": tehsil_unit.name if tehsil_unit else parcel.taluka,
                    "unit_type": "TEHSIL"
                },
                "village_or_locality": {
                    "code": village_unit.code if village_unit else f"DL-VIL-{parcel.village.upper().replace(' ', '')}",
                    "name": village_unit.name if village_unit else parcel.village,
                    "unit_type": "VILLAGE"
                }
            },
            "provenance": {
                "source_state": parcel.source_state,
                "source_system": parcel.source_system,
                "source_record_id": parcel.source_record_id,
                "provenance_type": parcel.provenance_type,
            },
            "dispute_cases": [
                {
                    "case_number": d.case_number,
                    "court_type": d.court_type,
                    "title": d.title,
                    "dispute_category": d.dispute_category,
                    "status": d.status,
                    "risk_level": d.risk_level,
                    "plaintiff": d.plaintiff,
                    "defendant": d.defendant,
                    "estimated_value_lakhs": d.estimated_value_lakhs,
                    "filing_date": d.filing_date,
                    "next_hearing_date": d.next_hearing_date,
                    "source_system": d.source_system
                }
                for d in disputes
            ],
            "trace_status": {
                "has_disputes": len(disputes) > 0,
                "disputes_count": len(disputes),
                "is_ulpin_verified": parcel.ulpin is not None,
                "is_geo_referenced": parcel.geojson_polygon is not None
            }
        }

    @staticmethod
    def get_administrative_tree(session: Session, state_code: str = "DL") -> Dict[str, Any]:
        """Build the full State -> District -> Tehsil -> Village tree."""
        units = session.exec(
            select(AdministrativeUnit).where(AdministrativeUnit.state_code == state_code)
        ).all()

        by_type: Dict[str, List[AdministrativeUnit]] = {
            "STATE": [], "DISTRICT": [], "TEHSIL": [], "VILLAGE": [], "WARD": []
        }
        for u in units:
            if u.unit_type in by_type:
                by_type[u.unit_type].append(u)

        return {
            "state": state_code,
            "districts_count": len(by_type["DISTRICT"]),
            "tehsils_count": len(by_type["TEHSIL"]),
            "villages_count": len(by_type["VILLAGE"]),
            "wards_count": len(by_type["WARD"]),
            "districts": [
                {
                    "code": d.code,
                    "name": d.name,
                    "has_geometry": d.geojson_boundary is not None,
                    "tehsils": [
                        {"code": t.code, "name": t.name}
                        for t in by_type["TEHSIL"] if t.parent_code == d.code
                    ]
                }
                for d in by_type["DISTRICT"]
            ]
        }

    @staticmethod
    def get_provenance_audit(session: Session) -> Dict[str, Any]:
        """Return audit summary of data provenance across parcels, disputes, and ingestion batches."""
        batches = session.exec(select(IngestionBatch).order_by(IngestionBatch.created_at.desc())).all()
        parcels = session.exec(select(LandParcel)).all()
        disputes = session.exec(select(DisputeCase)).all()

        provenance_breakdown = {}
        for p in parcels:
            key = f"{p.source_system} ({p.provenance_type})"
            provenance_breakdown[key] = provenance_breakdown.get(key, 0) + 1

        return {
            "total_parcels": len(parcels),
            "total_disputes": len(disputes),
            "total_ingestion_batches": len(batches),
            "provenance_breakdown": provenance_breakdown,
            "data_quality_metrics": {
                "ulpin_coverage_pct": round(sum(1 for p in parcels if p.ulpin) / max(len(parcels), 1) * 100, 2),
                "geojson_coverage_pct": round(sum(1 for p in parcels if p.geojson_polygon) / max(len(parcels), 1) * 100, 2),
                "resolved_identifiers_pct": round(sum(1 for p in parcels if p.is_resolved) / max(len(parcels), 1) * 100, 2),
                "disputes_linked_to_parcels_pct": round(sum(1 for d in disputes if d.parcel_id) / max(len(disputes), 1) * 100, 2)
            },
            "recent_batches": [
                {
                    "batch_id": b.batch_id,
                    "source_system": b.source_system,
                    "source_state": b.source_state,
                    "records_total": b.records_total,
                    "records_ingested": b.records_ingested,
                    "records_failed": b.records_failed,
                    "status": b.status,
                    "created_at": b.created_at.isoformat()
                }
                for b in batches[:10]
            ]
        }
