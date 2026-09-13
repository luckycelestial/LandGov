from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import List, Optional

from app.domain.models.land_gov import InnovationItem
from app.infrastructure.db.sqlite_client import get_session

router = APIRouter(prefix="/innovation", tags=["National Innovation Portal & Hackathons"])


@router.get("/items", response_model=List[InnovationItem])
def list_innovation_items(
    item_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    query = select(InnovationItem)
    if item_type and item_type != "All":
        query = query.where(InnovationItem.item_type == item_type)
    if status and status != "All":
        query = query.where(InnovationItem.status == status)
    return session.exec(query).all()
