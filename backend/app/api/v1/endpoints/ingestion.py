import os
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.infrastructure.db.sqlite_client import get_session
from app.domain.services.ingestion.delhi_connector import DelhiConnector
from app.domain.services.ingestion.structured_adapter import StructuredLandRecordAdapter
from app.domain.services.ingestion.document_adapter import DocumentIngestionAdapter

router = APIRouter(prefix="/ingestion", tags=["Multi-Source Ingestion & Connectors (D7)"])

delhi_connector = DelhiConnector()
structured_adapter = StructuredLandRecordAdapter(delhi_connector)
document_adapter = DocumentIngestionAdapter(delhi_connector)


class GeoJSONIngestRequest(BaseModel):
    source_system: str = Field(default="DELHI_GEOPORTAL", description="Originating agency/system")
    provenance_type: str = Field(default="REAL", description="REAL, CURATED, SYNTHETIC, SEEDED")
    geojson: Dict[str, Any] = Field(..., description="GeoJSON Feature or FeatureCollection")


class CSVParcelsRequest(BaseModel):
    csv_content: str = Field(..., description="Raw CSV string with headers")
    source_system: str = Field(default="DORIS_CSV_IMPORT")
    provenance_type: str = Field(default="CURATED")


class OrderTextRequest(BaseModel):
    order_text: str = Field(..., description="Extracted text from court order or revenue gazette")
    filename: Optional[str] = "court_order.pdf"
    district: Optional[str] = "South Delhi"
    court_type: Optional[str] = "Revenue Court (SDM)"
    provenance_type: Optional[str] = "CURATED"


@router.post("/geojson")
def ingest_geojson(
    payload: GeoJSONIngestRequest,
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """Ingest GeoJSON cadastral features into canonical LandParcel and AdministrativeUnit tables."""
    delhi_connector.default_source_system = payload.source_system
    result = delhi_connector.ingest_geojson(
        geojson_data=payload.geojson,
        session=session,
        provenance_type=payload.provenance_type
    )
    if not result.get("success") and result.get("records_ingested", 0) == 0:
        raise HTTPException(status_code=400, detail=result)
    return result


@router.post("/csv-parcels")
def ingest_csv_parcels(
    payload: CSVParcelsRequest,
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """Ingest tabular land records from CSV into canonical LandParcel store."""
    result = structured_adapter.ingest_parcels_csv(
        csv_text=payload.csv_content,
        session=session,
        source_system=payload.source_system,
        provenance_type=payload.provenance_type
    )
    if not result.get("success") and result.get("records_ingested", 0) == 0:
        raise HTTPException(status_code=400, detail=result)
    return result


@router.post("/disputes-json")
def ingest_disputes(
    disputes: List[Dict[str, Any]] = Body(...),
    source_system: str = "DELHI_ECOURTS_SYNC",
    provenance_type: str = "CURATED",
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """Ingest structured dispute records and automatically resolve foreign key linkage to LandParcels."""
    result = structured_adapter.ingest_disputes_json(
        disputes_data=disputes,
        session=session,
        source_system=source_system,
        provenance_type=provenance_type
    )
    if not result.get("success") and result.get("records_ingested", 0) == 0:
        raise HTTPException(status_code=400, detail=result)
    return result


@router.post("/order-document")
def ingest_order_document(
    payload: OrderTextRequest,
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """Parse semi-structured legal text / court order and ingest into DisputeCase with parcel linkage."""
    result = document_adapter.parse_and_ingest_order_text(
        text=payload.order_text,
        session=session,
        document_filename=payload.filename or "court_order.pdf",
        court_type=payload.court_type or "Revenue Court (SDM)",
        district=payload.district or "South Delhi",
        provenance_type=payload.provenance_type or "CURATED"
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result)
    return result


@router.post("/seed-delhi-assets")
def seed_delhi_assets(session: Session = Depends(get_session)) -> Dict[str, Any]:
    """
    Ingests official Delhi GeoJSON assets (11 districts, sample wards)
    from frontend public directory into AdministrativeUnit table.
    """
    # Look for frontend public directory
    possible_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../frontend/public")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../AAkar/frontend/public")),
        "/home/luckycelestial/Pavithran/SIH 26019/LandGov-Platform/frontend/public"
    ]

    found_path = None
    for p in possible_paths:
        if os.path.exists(os.path.join(p, "delhi_districts.geojson")):
            found_path = p
            break

    if not found_path:
        raise HTTPException(status_code=404, detail="Delhi GeoJSON asset directory not found.")

    res = delhi_connector.seed_from_local_geojson_assets(session=session, public_dir=found_path)
    return {
        "status": "success",
        "message": "Delhi administrative layers ingested successfully.",
        "assets_path": found_path,
        "details": res
    }
