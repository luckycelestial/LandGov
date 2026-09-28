import os
import json
from pathlib import Path
from sqlmodel import SQLModel, create_engine, Session, select
from app.core.config import settings
from app.core.security import hash_password
from app.domain.models.land_gov import (
    User, LandParcel, DisputeCase, PolicyReform, ResearchPaper, InnovationItem,
    AdministrativeUnit, IngestionBatch
)

# Ensure data directory exists
os.makedirs(os.path.dirname(settings.DATABASE_URL.replace("sqlite:///", "")), exist_ok=True)

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)


def _migrate_sqlite_columns():
    """Ensure newly added columns exist in existing SQLite tables."""
    import sqlite3
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    if not os.path.exists(db_path):
        return
    
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    # Column additions for land_parcels
    cur.execute("PRAGMA table_info(land_parcels);")
    existing_parcel_cols = {r[1] for r in cur.fetchall()}
    parcel_col_defs = [
        ("ulpin", "TEXT"),
        ("source_state", "TEXT DEFAULT 'DL'"),
        ("source_system", "TEXT DEFAULT 'DELHI_REVENUE_PORTAL'"),
        ("source_record_id", "TEXT"),
        ("provenance_type", "TEXT DEFAULT 'CURATED'"),
        ("is_resolved", "BOOLEAN DEFAULT 1"),
        ("ward", "TEXT"),
        ("constituency", "TEXT"),
    ]
    for col, col_type in parcel_col_defs:
        if col not in existing_parcel_cols:
            try:
                cur.execute(f"ALTER TABLE land_parcels ADD COLUMN {col} {col_type};")
            except Exception as e:
                print(f"Migration notice for land_parcels.{col}: {e}")

    # Column additions for dispute_cases
    cur.execute("PRAGMA table_info(dispute_cases);")
    existing_dispute_cols = {r[1] for r in cur.fetchall()}
    dispute_col_defs = [
        ("parcel_id", "INTEGER"),
        ("ulpin", "TEXT"),
        ("source_system", "TEXT DEFAULT 'DELHI_ECOURTS'"),
        ("source_record_id", "TEXT"),
        ("provenance_type", "TEXT DEFAULT 'CURATED'"),
    ]
    for col, col_type in dispute_col_defs:
        if col not in existing_dispute_cols:
            try:
                cur.execute(f"ALTER TABLE dispute_cases ADD COLUMN {col} {col_type};")
            except Exception as e:
                print(f"Migration notice for dispute_cases.{col}: {e}")

    con.commit()
    con.close()


def get_session():
    with Session(engine) as session:
        yield session


def seed_delhi_administrative_units(session: Session):
    """Seed Delhi administrative hierarchy: State -> Districts -> Tehsils -> Villages/Wards."""
    existing = session.exec(select(AdministrativeUnit)).first()
    if existing:
        return

    print("🏛️ Seeding canonical Delhi administrative hierarchy...")

    # State
    state = AdministrativeUnit(
        unit_type="STATE",
        code="DL",
        name="NCT of Delhi",
        parent_code=None,
        state_code="DL",
        lgd_code="07",
        source_system="DELHI_GEOPORTAL",
        provenance_type="REAL"
    )
    session.add(state)

    # 11 Districts of Delhi
    delhi_districts = [
        ("DL-CENTRAL", "Central Delhi", "DL"),
        ("DL-EAST", "East Delhi", "DL"),
        ("DL-NEWDELHI", "New Delhi", "DL"),
        ("DL-NORTH", "North Delhi", "DL"),
        ("DL-NORTHEAST", "North East Delhi", "DL"),
        ("DL-NORTHWEST", "North West Delhi", "DL"),
        ("DL-SHAHDARA", "Shahdara", "DL"),
        ("DL-SOUTH", "South Delhi", "DL"),
        ("DL-SOUTHEAST", "South East Delhi", "DL"),
        ("DL-SOUTHWEST", "South West Delhi", "DL"),
        ("DL-WEST", "West Delhi", "DL"),
    ]

    for code, name, parent in delhi_districts:
        session.add(AdministrativeUnit(
            unit_type="DISTRICT",
            code=code,
            name=name,
            parent_code=parent,
            state_code="DL",
            source_system="DELHI_GEOPORTAL",
            provenance_type="REAL"
        ))

    # Core Sub-Districts / Tehsils for Delhi
    tehsils = [
        ("DL-TEH-MEHRAULI", "Mehrauli", "DL-SOUTH"),
        ("DL-TEH-SAKET", "Saket", "DL-SOUTH"),
        ("DL-TEH-NAJAFGARH", "Najafgarh", "DL-SOUTHWEST"),
        ("DL-TEH-DWARKA", "Dwarka", "DL-SOUTHWEST"),
        ("DL-TEH-ALIPUR", "Alipur", "DL-NORTH"),
        ("DL-TEH-NARELA", "Narela", "DL-NORTH"),
        ("DL-TEH-SHAHDARA", "Shahdara", "DL-SHAHDARA"),
        ("DL-TEH-CHANAKYAPURI", "Chanakyapuri", "DL-NEWDELHI"),
    ]
    for code, name, parent in tehsils:
        session.add(AdministrativeUnit(
            unit_type="TEHSIL",
            code=code,
            name=name,
            parent_code=parent,
            state_code="DL",
            source_system="DELHI_REVENUE_PORTAL",
            provenance_type="REAL"
        ))

    # Sample Localities / Villages
    villages = [
        ("DL-VIL-MEHRAULI", "Mehrauli Village", "DL-TEH-MEHRAULI"),
        ("DL-VIL-NAJAFGARH", "Najafgarh Village", "DL-TEH-NAJAFGARH"),
        ("DL-VIL-ALIPUR", "Alipur Village", "DL-TEH-ALIPUR"),
        ("DL-VIL-VASANTKUNJ", "Vasant Kunj Fringe", "DL-TEH-MEHRAULI"),
        ("DL-VIL-NARELA", "Narela Village", "DL-TEH-NARELA"),
    ]
    for code, name, parent in villages:
        session.add(AdministrativeUnit(
            unit_type="VILLAGE",
            code=code,
            name=name,
            parent_code=parent,
            state_code="DL",
            source_system="DELHI_REVENUE_PORTAL",
            provenance_type="REAL"
        ))

    session.commit()


def reconcile_dispute_parcel_links(session: Session):
    """Ensure dispute cases have actual foreign key linkage to corresponding land parcels, and parcels have ULPIN."""
    parcels = session.exec(select(LandParcel)).all()
    ulpin_map = {
        "104/1A": "DL-07-2852-7718-1041",
        "218/3B": "DL-07-2860-7698-2183",
        "44/2": "DL-07-2879-7713-0044",
        "78/5C": "DL-07-2867-7729-0078",
        "312/9": "DL-07-2853-7714-0312",
        "512/1": "DL-07-2885-7709-0512",
    }
    for p in parcels:
        if not p.ulpin and p.khasra_no in ulpin_map:
            p.ulpin = ulpin_map[p.khasra_no]
            session.add(p)

    parcel_by_khasra = {p.khasra_no: p for p in parcels}

    disputes = session.exec(select(DisputeCase)).all()
    updated = False
    for d in disputes:
        if d.khasra_no in parcel_by_khasra:
            p = parcel_by_khasra[d.khasra_no]
            if d.parcel_id != p.id or d.ulpin != p.ulpin:
                d.parcel_id = p.id
                d.ulpin = p.ulpin
                session.add(d)
                updated = True
    session.commit()


def seed_database():
    SQLModel.metadata.create_all(engine)
    _migrate_sqlite_columns()

    with Session(engine) as session:
        # Check if already seeded
        existing_user = session.exec(select(User)).first()
        if not existing_user:
            print("🌱 Seeding initial Land Governance data...")

            default_pwd = hash_password("123456")

            # 1. Users
            users = [
                User(email="superadmin@landgov.gov.in", hashed_password=default_pwd, display_name="National System Administrator", role="SUPER_ADMIN", department="DoLR Central Directorate", state_id="ALL", district_id="ALL"),
                User(email="mord.secretary@landgov.gov.in", hashed_password=default_pwd, display_name="MoRD Joint Secretary (PME)", role="MINISTRY_OFFICIAL", department="Ministry of Rural Development", state_id="ALL", district_id="ALL"),
                User(email="state.delhi@landgov.gov.in", hashed_password=default_pwd, display_name="Delhi State Revenue Secretary", role="STATE_SECRETARY", department="Delhi Revenue Dept", state_id="DL", district_id="ALL"),
                User(email="dm.newdelhi@landgov.gov.in", hashed_password=default_pwd, display_name="District Magistrate (New Delhi)", role="DISTRICT_MAGISTRATE", department="District Collectorate", state_id="DL", district_id="ND"),
                User(email="revenue.officer@landgov.gov.in", hashed_password=default_pwd, display_name="Tehsildar & Sub-Registrar", role="REVENUE_OFFICER", department="Tehsil Revenue Office", state_id="DL", district_id="ND"),
                User(email="researcher@iitd.ac.in", hashed_password=default_pwd, display_name="Dr. Arishta Sen (Lead Researcher)", role="RESEARCHER", department="IIT Delhi Geospatial AI Lab", state_id="DL", district_id="ND"),
                User(email="citizen@bharatmail.in", hashed_password=default_pwd, display_name="Rameshwar Prasad (Land Owner)", role="CITIZEN", department="Public Landholder", state_id="DL", district_id="ND"),
            ]
            session.add_all(users)

            # 2. Land Parcels (with GeoJSON polygons and coordinates)
            parcels_data = [
                {
                    "khasra_no": "104/1A", "village": "Mehrauli", "taluka": "South Delhi", "district": "South Delhi", "state": "Delhi",
                    "area_acres": 4.85, "land_use": "Agricultural", "owner_name": "Rameshwar Prasad & Brothers",
                    "title_status": "Clear", "svamitva_issued": True, "is_digitized": True,
                    "lat": 28.5244, "lng": 77.1855, "dispute_risk_score": 12.5, "climate_vulnerability_index": 28.0,
                    "last_mutation_date": "2024-03-15",
                    "ulpin": "DL-07-2852-7718-1041",
                    "source_state": "DL",
                    "source_system": "DORIS_BHUNAKSHA",
                    "source_record_id": "DORIS-DL-2024-00104",
                    "provenance_type": "CURATED",
                    "is_resolved": True,
                    "geojson_polygon": json.dumps([[77.184, 28.523], [77.187, 28.523], [77.186, 28.526], [77.183, 28.525], [77.184, 28.523]])
                },
                {
                    "khasra_no": "218/3B", "village": "Najafgarh", "taluka": "South West Delhi", "district": "South West Delhi", "state": "Delhi",
                    "area_acres": 12.20, "land_use": "Agricultural", "owner_name": "Kishan Lal Yadav",
                    "title_status": "Disputed", "svamitva_issued": False, "is_digitized": True,
                    "lat": 28.6090, "lng": 76.9850, "dispute_risk_score": 78.4, "climate_vulnerability_index": 45.2,
                    "last_mutation_date": "2021-11-04",
                    "ulpin": "DL-07-2860-7698-2183",
                    "source_state": "DL",
                    "source_system": "DORIS_BHUNAKSHA",
                    "source_record_id": "DORIS-DL-2021-00218",
                    "provenance_type": "CURATED",
                    "is_resolved": True,
                    "geojson_polygon": json.dumps([[76.983, 28.607], [76.987, 28.608], [76.986, 28.611], [76.982, 28.610], [76.983, 28.607]])
                },
                {
                    "khasra_no": "44/2", "village": "Alipur", "taluka": "North Delhi", "district": "North Delhi", "state": "Delhi",
                    "area_acres": 8.10, "land_use": "Commercial", "owner_name": "Apex Logistics & Agro Parks Ltd",
                    "title_status": "Clear", "svamitva_issued": True, "is_digitized": True,
                    "lat": 28.7980, "lng": 77.1350, "dispute_risk_score": 22.0, "climate_vulnerability_index": 19.8,
                    "last_mutation_date": "2025-01-10",
                    "ulpin": "DL-07-2879-7713-0044",
                    "source_state": "DL",
                    "source_system": "DELHI_GEOPORTAL",
                    "source_record_id": "DORIS-DL-2025-00044",
                    "provenance_type": "CURATED",
                    "is_resolved": True,
                    "geojson_polygon": json.dumps([[77.133, 28.796], [77.137, 28.797], [77.136, 28.800], [77.132, 28.799], [77.133, 28.796]])
                },
                {
                    "khasra_no": "78/5C", "village": "Shahdara", "taluka": "East Delhi", "district": "East Delhi", "state": "Delhi",
                    "area_acres": 2.45, "land_use": "Residential", "owner_name": "Savitri Devi Trust",
                    "title_status": "Under-Mutation", "svamitva_issued": False, "is_digitized": True,
                    "lat": 28.6730, "lng": 77.2910, "dispute_risk_score": 54.0, "climate_vulnerability_index": 68.5,
                    "last_mutation_date": "2026-02-18",
                    "ulpin": "DL-07-2867-7729-0078",
                    "source_state": "DL",
                    "source_system": "DELHI_REVENUE_PORTAL",
                    "source_record_id": "DORIS-DL-2026-00078",
                    "provenance_type": "CURATED",
                    "is_resolved": True,
                    "geojson_polygon": json.dumps([[77.289, 28.671], [77.293, 28.672], [77.292, 28.675], [77.288, 28.674], [77.289, 28.671]])
                },
                {
                    "khasra_no": "312/9", "village": "Vasant Kunj Fringe", "taluka": "South Delhi", "district": "South Delhi", "state": "Delhi",
                    "area_acres": 6.70, "land_use": "Forest / Ridge Buffer", "owner_name": "Delhi Forest Department / Gram Sabha",
                    "title_status": "Disputed", "svamitva_issued": False, "is_digitized": True,
                    "lat": 28.5320, "lng": 77.1420, "dispute_risk_score": 89.1, "climate_vulnerability_index": 82.0,
                    "last_mutation_date": "2019-08-22",
                    "ulpin": "DL-07-2853-7714-0312",
                    "source_state": "DL",
                    "source_system": "DELHI_FOREST_PORTAL",
                    "source_record_id": "DFD-2019-3129",
                    "provenance_type": "CURATED",
                    "is_resolved": True,
                    "geojson_polygon": json.dumps([[77.140, 28.530], [77.144, 28.531], [77.143, 28.534], [77.139, 28.533], [77.140, 28.530]])
                },
                {
                    "khasra_no": "512/1", "village": "Narela", "taluka": "North Delhi", "district": "North Delhi", "state": "Delhi",
                    "area_acres": 15.30, "land_use": "Industrial", "owner_name": "State Industrial Dev Corp",
                    "title_status": "Clear", "svamitva_issued": True, "is_digitized": True,
                    "lat": 28.8520, "lng": 77.0920, "dispute_risk_score": 15.0, "climate_vulnerability_index": 25.0,
                    "last_mutation_date": "2025-06-12",
                    "ulpin": "DL-07-2885-7709-0512",
                    "source_state": "DL",
                    "source_system": "DELHI_DSIIDC",
                    "source_record_id": "DSIIDC-2025-0512",
                    "provenance_type": "CURATED",
                    "is_resolved": True,
                    "geojson_polygon": json.dumps([[77.090, 28.850], [77.094, 28.851], [77.093, 28.854], [77.089, 28.853], [77.090, 28.850]])
                }
            ]
            for p in parcels_data:
                session.add(LandParcel(**p))

            # 3. Dispute Cases
            disputes = [
                DisputeCase(
                    case_number="REV/2026/DL-4912", khasra_no="218/3B", district="South West Delhi", state="Delhi",
                    court_type="Revenue Court (SDM)", title="Yadav vs Gram Panchayat Najafgarh",
                    description="Encroachment claim over 2.5 acres of common grazing pasture adjacent to Khasra 218/3B.",
                    dispute_category="Boundary Encroachment", status="Active",
                    filing_date="2023-04-12", next_hearing_date="2026-09-28",
                    estimated_value_lakhs=185.0, plaintiff="Gram Panchayat Najafgarh", defendant="Kishan Lal Yadav", risk_level="High",
                    source_system="DELHI_REVENUE_COURT", provenance_type="CURATED"
                ),
                DisputeCase(
                    case_number="CIV/2025/DL-8821", khasra_no="312/9", district="South Delhi", state="Delhi",
                    court_type="District Civil Court Saket", title="Forest Dept vs Private Developers Syndicate",
                    description="Title dispute regarding Eco-sensitive Ridge zone boundary overlap with private farmhouses.",
                    dispute_category="Gram Sabha Land", status="Mediation",
                    filing_date="2021-09-10", next_hearing_date="2026-10-15",
                    estimated_value_lakhs=640.0, plaintiff="Delhi Forest Department", defendant="Syndicate Realty Corp", risk_level="Critical",
                    source_system="DELHI_ECOURTS", provenance_type="CURATED"
                ),
                DisputeCase(
                    case_number="MUT/2026/DL-1102", khasra_no="78/5C", district="East Delhi", state="Delhi",
                    court_type="Tehsildar Tribunal", title="Inheritance Mutation Contest (Devi Lineage)",
                    description="Succession certificate dispute following demise of primary title holder without registered will.",
                    dispute_category="Succession/Inheritance", status="Active",
                    filing_date="2025-11-20", next_hearing_date="2026-09-22",
                    estimated_value_lakhs=95.0, plaintiff="Mukesh Kumar", defendant="Savitri Devi Trust", risk_level="Medium",
                    source_system="DELHI_REVENUE_COURT", provenance_type="CURATED"
                ),
                DisputeCase(
                    case_number="REV/2024/DL-0044", khasra_no="104/1A", district="South Delhi", state="Delhi",
                    court_type="Revenue Court (SDM)", title="Prasad Boundary Demarcation Review",
                    description="Drone survey verification resolved boundary variance of 0.12 acres.",
                    dispute_category="Boundary Encroachment", status="Disposed",
                    filing_date="2024-01-05", next_hearing_date="2024-03-15",
                    estimated_value_lakhs=35.0, plaintiff="Rameshwar Prasad", defendant="Adjacent Plot 104/1B", risk_level="Low",
                    source_system="DELHI_REVENUE_COURT", provenance_type="CURATED"
                )
            ]
            session.add_all(disputes)

            # 4. Policy Reforms
            reforms = [
                PolicyReform(
                    policy_code="SVAMITVA-2.0", title="National Abadi Land Survey & Property Card Issuance",
                    focus_domain="SVAMITVA", status="Enacted", target_year=2026,
                    description="Drone-based spatial mapping across 6.5 lakh Indian villages to provide institutional credit access.",
                    target_metric="6,50,000 Villages", achieved_metric="4,92,400 Villages (75.7%)", compliance_score=92.4
                ),
                PolicyReform(
                    policy_code="DILRMP-INTEG", title="Digital India Land Records Modernization Programme (Core)",
                    focus_domain="Cadastral Modernization", status="Enacted", target_year=2026,
                    description="100% computerization of RoR (Record of Rights), cadastral map digitization, and sub-registrar integration.",
                    target_metric="100% Cadastral Digitization", achieved_metric="94.2% Nationwide", compliance_score=88.0
                ),
                PolicyReform(
                    policy_code="FAST-REV-2026", title="AI-Driven Revenue Court Dispute Resolution Framework",
                    focus_domain="Dispute Reduction", status="Consultation", target_year=2027,
                    description="Standardized digital summary hearings and automated boundary conflict reconciliation algorithms.",
                    target_metric="50% Pendency Reduction", achieved_metric="32.8% In Pilot Districts", compliance_score=79.5
                ),
                PolicyReform(
                    policy_code="WOMEN-TENURE", title="Gender-Disaggregated Land Title & Succession Protections",
                    focus_domain="Women Land Rights", status="Proposed", target_year=2027,
                    description="Mandatory co-titling in state land distributions and simplified inheritance registry updates.",
                    target_metric="30% Joint Titling Share", achieved_metric="18.4% Currently", compliance_score=65.0
                )
            ]
            session.add_all(reforms)

            # 5. Research Papers
            papers = [
                ResearchPaper(
                    title="AI-Enabled Cadastral Boundary Extraction from Very High-Resolution Drone Imagery",
                    authors="Dr. Arishta Sen, Prof. K. Ramanathan", institution="IIT Delhi & National Remote Sensing Centre (NRSC)",
                    domain="Geospatial AI",
                    abstract="This paper introduces a DeepLabV3+ with geometric regularization tailored for extracting agricultural field bunds from sub-decimeter drone surveys, reducing surveyor manual digitization time by 82%.",
                    keywords="Deep Learning, Cadastral Maps, SVAMITVA, Drone Surveys, Remote Sensing",
                    publication_date="2025-12-10", citation_count=48, read_time_minutes=12
                ),
                ResearchPaper(
                    title="Evaluating the Macroeconomic Multiplier of Land Record Modernization in Rural India",
                    authors="Dr. M. R. Deshmukh, Vandana Chawla", institution="NITI Aayog & Indira Gandhi Institute of Development Research",
                    domain="Land Law Economics",
                    abstract="Empirical analysis demonstrating that digital property titles increase formal agricultural credit disbursement by 24.3% and lower land litigation costs by 31% over a 3-year post-digitization horizon.",
                    keywords="Land Tenure, Rural Credit, Agricultural GDP, DILRMP, Economic Impact",
                    publication_date="2025-08-24", citation_count=73, read_time_minutes=15
                ),
                ResearchPaper(
                    title="Climate Vulnerability Mapping for Sustainable Agro-Ecological Land Zoning",
                    authors="S. K. Verma, Dr. Elizabeth Thomas", institution="Indian Institute of Science (IISc) Bengaluru",
                    domain="Climate Adaptation",
                    abstract="A spatial multi-criteria decision framework integrating 30-year IMD precipitation anomalies, soil degradation indices, and aquifer depletion rates to generate climate-resilient land zoning guidelines.",
                    keywords="Climate Resilience, LULC, Spatial Modeling, Agro-Ecology, Groundwater",
                    publication_date="2026-02-14", citation_count=29, read_time_minutes=10
                )
            ]
            session.add_all(papers)

            # 6. Innovation Items
            innovations = [
                InnovationItem(
                    item_type="HACKATHON", title="SIH 26019: National Land Governance AI Innovation Challenge",
                    prize_amount="₹ 10,00,000", deadline="2026-11-30", status="Open",
                    description="National software competition inviting student and start-up teams to build predictive dispute models and digital twin simulators.",
                    eligibility="Indian University Students, Startups & Research Scholars", submissions_count=142
                ),
                InnovationItem(
                    item_type="RESEARCH_GRANT", title="DoLR Applied Research Grant on Geospatial Policy 2026",
                    prize_amount="₹ 25,00,000 per Project", deadline="2026-12-15", status="Open",
                    description="Competitive research grants for academic institutions developing automated boundary conflict resolution and tenure security metrics.",
                    eligibility="Accredited Academic Institutions & Think Tanks", submissions_count=38
                ),
                InnovationItem(
                    item_type="PILOT_PROJECT", title="Smart Patwari Field Assistant - Multilingual Voice Pilot",
                    prize_amount="Pilot Stage (Phase II)", deadline="2026-10-01", status="Under Review",
                    description="Voice-first mobile interface testing across 50 tehsils in Rajasthan and Madhya Pradesh for field survey record updates.",
                    eligibility="State Revenue Departments in Collaboration with NIC", submissions_count=12
                )
            ]
            session.add_all(innovations)

            session.commit()
            print("✅ Land Governance database successfully seeded!")

        # Always ensure administrative units and dispute-parcel linkages are seeded & reconciled
        seed_delhi_administrative_units(session)
        reconcile_dispute_parcel_links(session)


def init_db():
    SQLModel.metadata.create_all(engine)
    _migrate_sqlite_columns()
    seed_database()
