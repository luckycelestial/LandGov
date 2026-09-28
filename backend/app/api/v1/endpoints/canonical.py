from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session
from typing import Dict, Any, Optional

from app.infrastructure.db.sqlite_client import get_session
from app.domain.services.canonical_service import CanonicalService
from app.domain.services.ingestion.delhi_connector import DelhiConnector

router = APIRouter(prefix="/canonical", tags=["Canonical Data & Governance Gateway (D12)"])
delhi_connector = DelhiConnector()


@router.get("/trace/{identifier:path}")
def trace_parcel(
    identifier: str,
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Trace a land parcel through its complete administrative hierarchy and linked legal disputes.
    Accepts:
    - Integer Database ID (e.g. '1', '2')
    - 14-character ULPIN / Bhu-Aadhaar (e.g. 'DL-07-2860-7698-2183')
    - Survey / Khasra number (e.g. '218/3B', '104/1A')
    """
    trace = CanonicalService.trace_parcel(identifier, session)
    if not trace:
        raise HTTPException(status_code=404, detail=f"No parcel found matching identifier '{identifier}'.")
    return trace


@router.get("/hierarchy")
def get_administrative_hierarchy(
    state_code: str = Query("DL", description="Two-letter state code e.g. DL, UP, MH"),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """Retrieve canonical jurisdiction-neutral administrative tree (State -> District -> Tehsil -> Village)."""
    return CanonicalService.get_administrative_tree(session=session, state_code=state_code)


@router.get("/provenance")
def get_provenance_audit(
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Retrieve system-wide data provenance breakdown, ULPIN coverage,
    and data quality indicators across all registered sources.
    """
    return CanonicalService.get_provenance_audit(session)


@router.post("/validate")
def validate_payload(
    payload: Dict[str, Any] = Body(...),
) -> Dict[str, Any]:
    """
    Dry-run validation for incoming cadastral records or GeoJSON.
    Returns normalized canonical shape, validation errors, and coordinate checks.
    """
    geom = payload.get("geometry")
    geom_valid = True
    geom_error = None
    if geom:
        geom_valid, geom_error = delhi_connector.validate_geojson_geometry(geom)

    try:
        norm = delhi_connector.normalize_record(payload)
        in_bounds = delhi_connector.validate_bounds(norm["lat"], norm["lng"])
        return {
            "valid": geom_valid and in_bounds,
            "geometry_valid": geom_valid,
            "geometry_error": geom_error,
            "coordinates_in_bounds": in_bounds,
            "normalized_record": norm
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e)
        }
