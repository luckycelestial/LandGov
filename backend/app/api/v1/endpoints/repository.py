from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import List, Optional

from app.domain.models.land_gov import ResearchPaper, PolicyReform
from app.infrastructure.db.sqlite_client import get_session

router = APIRouter(prefix="/repository", tags=["Centralized Research & Policy Repository"])


@router.get("/papers", response_model=List[ResearchPaper])
def list_papers(
    domain: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    query = select(ResearchPaper)
    if domain and domain != "All":
        query = query.where(ResearchPaper.domain == domain)
    if keyword:
        query = query.where(ResearchPaper.title.contains(keyword) | ResearchPaper.keywords.contains(keyword))
    return session.exec(query).all()


@router.get("/policies", response_model=List[PolicyReform])
def list_policies(
    status: Optional[str] = Query(None),
    focus_domain: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    query = select(PolicyReform)
    if status and status != "All":
        query = query.where(PolicyReform.status == status)
    if focus_domain and focus_domain != "All":
        query = query.where(PolicyReform.focus_domain == focus_domain)
    return session.exec(query).all()
