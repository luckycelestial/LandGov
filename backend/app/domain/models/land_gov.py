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

    # Canonical Provenance & Jurisdiction-Neutral Extensions (Deliverable 7 / Pavithran)
    ulpin: Optional[str] = Field(default=None, index=True)  # 14-digit Bhu-Aadhaar or None
    source_state: str = Field(default="DL", index=True)
    source_system: str = Field(default="DELHI_REVENUE_PORTAL", index=True)
    source_record_id: Optional[str] = Field(default=None, index=True)
    provenance_type: str = Field(default="CURATED")  # REAL, CURATED, SYNTHETIC, SEEDED
    is_resolved: bool = Field(default=True)
    ward: Optional[str] = None
    constituency: Optional[str] = None


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

    # Canonical Provenance & Parcel Linkage Extensions (Pavithran)
    parcel_id: Optional[int] = Field(default=None, index=True)
    ulpin: Optional[str] = Field(default=None, index=True)
    source_system: str = Field(default="DELHI_ECOURTS")
    source_record_id: Optional[str] = None
    provenance_type: str = Field(default="CURATED")


class AdministrativeUnit(SQLModel, table=True):
    """
    Canonical jurisdiction-neutral administrative boundary entity:
    State -> District -> Tehsil/Taluka -> Village / Ward / Constituency
    """
    __tablename__ = "administrative_units"

    id: Optional[int] = Field(default=None, primary_key=True)
    unit_type: str = Field(index=True)  # STATE, DISTRICT, TEHSIL, VILLAGE, WARD, CONSTITUENCY
    code: str = Field(unique=True, index=True)  # e.g. "DL", "DL-DIST-01", "DL-WARD-04"
    name: str = Field(index=True)
    parent_code: Optional[str] = Field(default=None, index=True)
    state_code: str = Field(default="DL", index=True)
    lgd_code: Optional[str] = None  # Local Government Directory code if available
    geojson_boundary: Optional[str] = None  # GeoJSON Feature or Polygon
    source_system: str = Field(default="DELHI_GEOPORTAL")
    provenance_type: str = Field(default="REAL")  # REAL, CURATED, SYNTHETIC
    metadata_json: Optional[str] = None


class IngestionBatch(SQLModel, table=True):
    """
    Audit log of multi-source ingestion runs with provenance & validation outcomes.
    """
    __tablename__ = "ingestion_batches"

    id: Optional[int] = Field(default=None, primary_key=True)
    batch_id: str = Field(unique=True, index=True)
    source_state: str = Field(index=True)
    source_system: str = Field(index=True)
    filename: Optional[str] = None
    records_total: int = 0
    records_ingested: int = 0
    records_failed: int = 0
    provenance_type: str = Field(default="REAL")
    status: str = Field(default="COMPLETED")  # COMPLETED, FAILED, PARTIAL
    errors_json: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


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
