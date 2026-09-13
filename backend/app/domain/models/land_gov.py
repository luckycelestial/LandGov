from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field, Column, JSON


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    display_name: str
    role: str = Field(index=True)  # SUPER_ADMIN, MINISTRY_OFFICIAL, STATE_SECRETARY, DISTRICT_MAGISTRATE, REVENUE_OFFICER, RESEARCHER, CITIZEN
    department: Optional[str] = "Department of Land Resources"
    state_id: Optional[str] = "DL"
    district_id: Optional[str] = "ND"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LandParcel(SQLModel, table=True):
    __tablename__ = "land_parcels"

    id: Optional[int] = Field(default=None, primary_key=True)
    khasra_no: str = Field(index=True)  # Survey / Khasra number e.g. "412/1A"
    village: str = Field(index=True)
    taluka: str
    district: str = Field(index=True)
    state: str = Field(index=True)
    area_acres: float
    land_use: str  # Agricultural, Residential, Commercial, Forest, Waterbody, Industrial
    owner_name: str
    owner_aadhar_hash: Optional[str] = None
    title_status: str = Field(index=True)  # Clear, Disputed, Mortgaged, Under-Mutation
    svamitva_issued: bool = False
    is_digitized: bool = True
    lat: float
    lng: float
    dispute_risk_score: float = 0.0  # 0 to 100
    climate_vulnerability_index: float = 0.0  # 0 to 100
    last_mutation_date: Optional[str] = None
    geojson_polygon: Optional[str] = None  # JSON string of polygon coordinates


class DisputeCase(SQLModel, table=True):
    __tablename__ = "dispute_cases"

    id: Optional[int] = Field(default=None, primary_key=True)
    case_number: str = Field(unique=True, index=True)  # e.g. "REV/2026/DL-4912"
    khasra_no: str = Field(index=True)
    district: str = Field(index=True)
    state: str = Field(index=True)
    court_type: str  # Revenue Court, District Civil Court, High Court, Fast-Track Tribunal
    title: str
    description: str
    dispute_category: str  # Boundary Encroachment, Succession/Inheritance, Illegal Mutation, Gram Sabha Land, Tenancy Rights
    status: str = Field(index=True)  # Active, Mediation, Reserved for Judgment, Disposed
    filing_date: str
    next_hearing_date: Optional[str] = None
    estimated_value_lakhs: float = 0.0
    plaintiff: str
    defendant: str
    risk_level: str = "Medium"  # Low, Medium, High, Critical


class PolicyReform(SQLModel, table=True):
    __tablename__ = "policy_reforms"

    id: Optional[int] = Field(default=None, primary_key=True)
    policy_code: str = Field(unique=True, index=True)  # e.g. "DILRMP-2026-V3"
    title: str
    ministry: str = "Ministry of Rural Development"
    department: str = "Department of Land Resources (DoLR)"
    focus_domain: str  # Cadastral Modernization, Dispute Reduction, Climate Zoning, Women Land Rights, SVAMITVA
    status: str = "Enacted"  # Proposed, Consultation, Enacted, In-Review
    target_year: int = 2026
    description: str
    target_metric: str
    achieved_metric: str
    compliance_score: float = 85.0


class ResearchPaper(SQLModel, table=True):
    __tablename__ = "research_papers"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    authors: str
    institution: str
    domain: str  # Geospatial AI, Land Law Economics, Climate Adaptation, Rural Development
    abstract: str
    keywords: str
    publication_date: str
    download_url: str = "#"
    citation_count: int = 0
    read_time_minutes: int = 8


class InnovationItem(SQLModel, table=True):
    __tablename__ = "innovation_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    item_type: str  # HACKATHON, RESEARCH_GRANT, PILOT_PROJECT, CHALLENGE
    title: str
    organizer: str = "DoLR & SIH Innovation Cell"
    prize_amount: str
    deadline: str
    status: str = "Open"  # Open, Under Review, Completed
    description: str
    eligibility: str
    submissions_count: int = 0
