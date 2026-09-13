from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import List, Optional

from app.domain.models.land_gov import DisputeCase
from app.infrastructure.db.sqlite_client import get_session

router = APIRouter(prefix="/disputes", tags=["Land Disputes & Litigation Tracker"])


@router.get("/", response_model=List[DisputeCase])
def list_disputes(
    status: Optional[str] = Query(None),
    court_type: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    khasra_no: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    query = select(DisputeCase)
    if status:
        query = query.where(DisputeCase.status == status)
    if court_type:
        query = query.where(DisputeCase.court_type == court_type)
    if risk_level:
        query = query.where(DisputeCase.risk_level == risk_level)
    if khasra_no:
        query = query.where(DisputeCase.khasra_no == khasra_no)
    
    return session.exec(query).all()


@router.get("/{case_id}", response_model=DisputeCase)
def get_dispute(case_id: int, session: Session = Depends(get_session)):
    case = session.get(DisputeCase, case_id)
    if not case:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Dispute case not found")
    return case
