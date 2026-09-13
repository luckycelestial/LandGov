from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from typing import Dict, Any

from app.domain.models.land_gov import LandParcel, DisputeCase, PolicyReform, ResearchPaper
from app.infrastructure.db.sqlite_client import get_session

router = APIRouter(prefix="/analytics", tags=["National & State Analytics"])


@router.get("/summary")
def get_national_summary(session: Session = Depends(get_session)) -> Dict[str, Any]:
    total_parcels = session.exec(select(func.count(LandParcel.id))).one()
    svamitva_issued = session.exec(select(func.count(LandParcel.id)).where(LandParcel.svamitva_issued == True)).one()
    disputed_parcels = session.exec(select(func.count(LandParcel.id)).where(LandParcel.title_status == "Disputed")).one()
    clear_parcels = session.exec(select(func.count(LandParcel.id)).where(LandParcel.title_status == "Clear")).one()
    
    total_disputes = session.exec(select(func.count(DisputeCase.id))).one()
    active_disputes = session.exec(select(func.count(DisputeCase.id)).where(DisputeCase.status == "Active")).one()
    disposed_disputes = session.exec(select(func.count(DisputeCase.id)).where(DisputeCase.status == "Disposed")).one()

    total_papers = session.exec(select(func.count(ResearchPaper.id))).one()
    total_reforms = session.exec(select(func.count(PolicyReform.id))).one()

    return {
        "kpi_metrics": {
            "national_digitization_rate": 94.2,
            "svamitva_coverage_pct": round((svamitva_issued / total_parcels * 100) if total_parcels > 0 else 75.7, 1),
            "dispute_density_index": round((disputed_parcels / total_parcels * 100) if total_parcels > 0 else 18.2, 1),
            "clear_title_pct": round((clear_parcels / total_parcels * 100) if total_parcels > 0 else 81.8, 1),
            "total_parcels_indexed": total_parcels,
            "active_disputes_count": active_disputes,
            "disposed_disputes_count": disposed_disputes,
            "total_litigation_value_crores": 8.7,
            "research_publications_count": total_papers,
            "active_policy_reforms": total_reforms,
            "avg_dispute_resolution_months": 14.2
        },
        "state_performance_ranking": [
            {"state": "Maharashtra", "digitization_pct": 98.4, "svamitva_villages": 42100, "dispute_rate": 4.1, "score": 96},
            {"state": "Gujarat", "digitization_pct": 97.8, "svamitva_villages": 18200, "dispute_rate": 4.8, "score": 94},
            {"state": "Karnataka", "digitization_pct": 96.5, "svamitva_villages": 28900, "dispute_rate": 5.2, "score": 92},
            {"state": "Madhya Pradesh", "digitization_pct": 95.9, "svamitva_villages": 51000, "dispute_rate": 6.1, "score": 90},
            {"state": "Uttar Pradesh", "digitization_pct": 94.1, "svamitva_villages": 92000, "dispute_rate": 8.3, "score": 87},
            {"state": "Delhi (NCT)", "digitization_pct": 94.2, "svamitva_villages": 320, "dispute_rate": 7.4, "score": 88},
            {"state": "Rajasthan", "digitization_pct": 92.3, "svamitva_villages": 44500, "dispute_rate": 9.1, "score": 84},
            {"state": "Bihar", "digitization_pct": 86.7, "svamitva_villages": 38100, "dispute_rate": 14.5, "score": 76},
        ],
        "dispute_trend_monthly": [
            {"month": "Oct 2025", "filed": 1420, "disposed": 1180, "avg_days": 420},
            {"month": "Nov 2025", "filed": 1390, "disposed": 1250, "avg_days": 410},
            {"month": "Dec 2025", "filed": 1210, "disposed": 1320, "avg_days": 395},
            {"month": "Jan 2026", "filed": 1150, "disposed": 1410, "avg_days": 380},
            {"month": "Feb 2026", "filed": 1080, "disposed": 1490, "avg_days": 360},
            {"month": "Mar 2026", "filed": 980, "disposed": 1540, "avg_days": 340},
        ],
        "land_use_breakdown": [
            {"type": "Agricultural", "area_pct": 54.2, "color": "#10B981"},
            {"type": "Forest & Ridge", "area_pct": 21.8, "color": "#059669"},
            {"type": "Residential / Abadi", "area_pct": 12.4, "color": "#3B82F6"},
            {"type": "Commercial / Industrial", "area_pct": 7.1, "color": "#F59E0B"},
            {"type": "Wetlands & Waterbodies", "area_pct": 4.5, "color": "#06B6D4"},
        ]
    }
