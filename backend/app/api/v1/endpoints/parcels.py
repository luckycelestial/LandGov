from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import List, Optional

from app.domain.models.land_gov import LandParcel
from app.infrastructure.db.sqlite_client import get_session

router = APIRouter(prefix="/parcels", tags=["Land Parcels & Cadastral Records"])


@router.get("/", response_model=List[LandParcel])
def list_parcels(
    district: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    village: Optional[str] = Query(None),
    min_dispute_risk: Optional[float] = Query(None),
    session: Session = Depends(get_session)
):
    query = select(LandParcel)
    if district:
        query = query.where(LandParcel.district == district)
    if status:
        query = query.where(LandParcel.title_status == status)
    if village:
        query = query.where(LandParcel.village == village)
    if min_dispute_risk:
        query = query.where(LandParcel.dispute_risk_score >= min_dispute_risk)
    
    return session.exec(query).all()


@router.get("/{parcel_id}", response_model=LandParcel)
def get_parcel(parcel_id: int, session: Session = Depends(get_session)):
    parcel = session.get(LandParcel, parcel_id)
    if not parcel:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Land parcel not found")
    return parcel
