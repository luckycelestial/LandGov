# DATA_CONTRACT.md
# LandGov / Bhumi-Gyan: Canonical Data Architecture, Provenance & Ingestion Contract (SIH 26019)
**Author / Data Architecture Specialist**: Pavithran  
**Sprint / Track**: `pavithran-day1` (Deliverable 7: Multi-Source Data Ingestion & Integration | Deliverable 12: APIs & Interoperability Gateway)

---

## 1. Architectural Vision & Scope

The LandGov / Bhumi-Gyan platform integrates heterogenous, multi-source land administration records, earth observation GIS layers, and legal dispute dockets into a **canonical, jurisdiction-neutral schema**.

While the MVP validates against the **National Capital Territory of Delhi** (11 revenue districts, 290 municipal wards, 70 assembly constituencies, and cadastral survey layers), the architecture is decoupled from any single state:
```
State Source Records (DORIS / Meebhoomi / AnyRoR / Bhulekh)
               │
               ▼
      [State Connector Adapter]  (e.g., DelhiConnector, UPConnector, MHConnector)
               │
               ▼
    Canonical Data Model (State -> District -> Tehsil -> Village -> Parcel/ULPIN)
        ├── Normalized Attributes (Area, Land Use, Title Status)
        ├── Provenance Metadata (source_state, source_system, provenance_type)
        └── Geospatial Geometry (GeoJSON Polygons / MVT Tiles)
               │
       ┌───────┴──────────────────────────┐
       ▼                                  ▼
[GIS Studio & 7-in-1 Dashboards]    [AI / RAG & Policy Simulation]
(Nithin Pranav - D4, D10)           (Salmon Angelo - D2, D5, D6)
```

---

## 2. Canonical Administrative Hierarchy

Every parcel is anchored to a four-tier spatial-administrative hierarchy:

```
Level 1: STATE                (e.g., "DL" - NCT of Delhi)
   │
Level 2: DISTRICT             (e.g., "DL-SOUTH" - South Delhi)
   │
Level 3: TEHSIL / TALUKA      (e.g., "DL-TEH-MEHRAULI" - Mehrauli Sub-District)
   │
Level 4: VILLAGE / WARD       (e.g., "DL-VIL-MEHRAULI" - Mehrauli Revenue Village / Ward)
   │
Level 5: PARCEL / ULPIN       (e.g., "DL-07-2852-7718-1041" - Khasra 104/1A)
```

### AdministrativeUnit Schema (`administrative_units`)

| Field | Type | Required | Description | Example |
| :--- | :--- | :---: | :--- | :--- |
| `id` | Integer | Yes (PK) | Auto-increment primary key | `1` |
| `unit_type` | String | Yes | `STATE`, `DISTRICT`, `TEHSIL`, `VILLAGE`, `WARD`, `CONSTITUENCY` | `"DISTRICT"` |
| `code` | String | Yes (Unique) | Normalized unique hierarchy code | `"DL-SOUTH"` |
| `name` | String | Yes | Canonical English display name | `"South Delhi"` |
| `parent_code` | String | No | Parent unit identifier | `"DL"` |
| `state_code` | String | Yes | Two-letter ISO/LGD state code | `"DL"` |
| `lgd_code` | String | No | Local Government Directory standard census code | `"08"` |
| `geojson_boundary` | String (JSON) | No | GeoJSON MultiPolygon boundary string | `{"type":"Polygon",...}` |
| `source_system` | String | Yes | Originating repository | `"DELHI_GEOPORTAL"` |
| `provenance_type` | String | Yes | `REAL`, `CURATED`, `SYNTHETIC`, `SEEDED` | `"REAL"` |

---

## 3. Canonical Land Parcel Schema (`land_parcels`)

This entity represents an individual cadastral land holding.

| Field | Type | Nullable | Description | Validation Rule |
| :--- | :--- | :---: | :--- | :--- |
| `id` | Integer (PK) | No | Unique parcel identifier | Auto-increment |
| `khasra_no` | String | No | Survey / Khasra / Plot Number | Retains source string; if missing, labeled `UNRESOLVED-{id}` |
| `ulpin` | String | Yes | 14-char Bhu-Aadhaar Geo-ID | Format: `{STATE}-{LGD}-{LAT4}-{LNG4}-{KHASRA4}` |
| `village` | String | No | Revenue village or ward name | Standardized string |
| `taluka` | String | No | Sub-district or tehsil | Standardized string |
| `district` | String | No | Revenue district | Must match state district registry |
| `state` | String | No | State name | e.g. `"Delhi"` |
| `area_acres` | Float | No | Parcel area in acres | Must be > 0.0 |
| `land_use` | String | No | Zoned classification | `Agricultural`, `Residential`, `Commercial`, `Forest`, `Industrial`, `Waterbody` |
| `owner_name` | String | No | Anonymized / PII-sanitized owner name | PII stripped (phone/numbers masked) |
| `owner_aadhar_hash` | String | Yes | SHA-256 hash of Aadhaar / National ID | Never raw 12-digit number |
| `title_status` | String | No | Legal status | `Clear`, `Disputed`, `Mortgaged`, `Under-Mutation` |
| `svamitva_issued` | Boolean | No | Property card issued under SVAMITVA | Boolean |
| `is_digitized` | Boolean | No | Cadastral map digitized | Boolean |
| `lat` | Float | No | Centroid latitude | For Delhi: `28.35 <= lat <= 28.95` |
| `lng` | Float | No | Centroid longitude | For Delhi: `76.80 <= lng <= 77.45` |
| `dispute_risk_score` | Float | No | Predictive litigation index (0–100) | `0.0 <= score <= 100.0` |
| `climate_vulnerability_index` | Float | No | Ecological vulnerability (0–100) | `0.0 <= score <= 100.0` |
| `geojson_polygon` | String (JSON) | Yes | Validated closed Polygon coordinate ring | Closed ring: point[0] == point[-1], >= 4 points |
| `source_state` | String | No | State code of source system | `"DL"` |
| `source_system` | String | No | Ingesting gateway | e.g. `"DORIS"`, `"BHUNAKSHA"`, `"DELHI_GEOPORTAL"` |
| `source_record_id` | String | Yes | Native ID in originating state database | String |
| `provenance_type` | String | No | Data authenticity classification | `REAL`, `CURATED`, `SYNTHETIC`, `SEEDED` |
| `is_resolved` | Boolean | No | Whether parcel has confirmed survey ID | False if missing ULPIN or Khasra |
| `ward` | String | Yes | Municipal ward identifier | e.g. `"CANT_1"` |
| `constituency` | String | Yes | Assembly constituency identifier | e.g. `"Delhi Cantt"` |

---

## 4. Canonical Dispute Case Schema (`dispute_cases`)

| Field | Type | Nullable | Description | Linkage |
| :--- | :--- | :---: | :--- | :--- |
| `id` | Integer (PK) | No | Unique dispute record | Auto-increment |
| `case_number` | String | No | Formal court case number | Unique index (e.g. `REV/2026/DL-4912`) |
| `khasra_no` | String | No | Contested land survey number | Cross-links to `land_parcels.khasra_no` |
| `parcel_id` | Integer | Yes | Foreign key to `land_parcels.id` | Resolves `parcel -> dispute` link |
| `ulpin` | String | Yes | Bhu-Aadhaar of contested parcel | Inherited from linked parcel |
| `district` | String | No | Judicial revenue district | Matches administrative unit |
| `court_type` | String | No | Court category | `Revenue Court (SDM)`, `District Civil Court`, `High Court` |
| `title` | String | No | Case caption | e.g. `"Yadav vs Gram Panchayat Najafgarh"` |
| `description` | String | No | Case synopsis | Text |
| `dispute_category` | String | No | Dispute typology | `Boundary Encroachment`, `Succession/Inheritance`, `Gram Sabha Land` |
| `status` | String | No | Current status | `Active`, `Mediation`, `Reserved for Judgment`, `Disposed` |
| `filing_date` | String | No | ISO Date (YYYY-MM-DD) | e.g. `"2023-04-12"` |
| `next_hearing_date` | String | Yes | Next scheduled court listing | e.g. `"2026-10-15"` |
| `estimated_value_lakhs`| Float | No | Disputed asset value in ₹ Lakhs | e.g. `185.0` |
| `plaintiff` | String | No | Complainant party | Sanitized PII |
| `defendant` | String | No | Respondent party | Sanitized PII |
| `risk_level` | String | No | Contagion risk rating | `Low`, `Medium`, `High`, `Critical` |
| `source_system` | String | No | Ingesting gateway | `"DELHI_ECOURTS"` or `"DELHI_REVENUE_COURT"` |
| `provenance_type` | String | No | Data origin classification | `REAL`, `CURATED`, `SYNTHETIC`, `SEEDED` |

---

## 5. Provenance Classification Standards

To guarantee research integrity and transparency, every ingested record is stamped with one of four strict labels:

1. **`REAL`**: Raw data ingested directly from official government databases, state gazettes, verified public GeoJSON portals (e.g., Delhi Open Data, Survey of India, ISRO Bhuvan).
2. **`CURATED`**: Authoritative data reconciled, normalized, or cross-referenced across multiple public documents by analysts (e.g., official court dockets mapped to cadastral numbers).
3. **`SYNTHETIC`**: Algorithmically simulated or generated data used for stress testing, scenario modeling, or edge-case validation.
4. **`SEEDED`**: Initial baseline records populated at system bootstrap for local development and demonstration.

---

## 6. Edge Cases & Validation Rules

1. **Missing Khasra / Survey Number**:
   * *Rule*: Never fabricate a survey number. Retain the source system's raw ID as `UNRESOLVED-{source_record_id}` and flag `is_resolved = False`.
2. **Missing ULPIN**:
   * *Rule*: If spatial coordinates and valid Khasra are provided, the connector generates a canonical ULPIN (`DL-{LGD}-{LAT}-{LNG}-{KHASRA}`). If coordinates are missing, `ulpin = None` and `is_resolved = False`.
3. **Invalid or Unclosed GeoJSON Polygon**:
   * *Rule*: Connectors reject unclosed rings (first point != last point) or polygons with < 4 points, producing structured HTTP 400 error payloads without crashing.
4. **Duplicate Parcel Detection**:
   * *Rule*: Deduplication is enforced on the tuple `(khasra_no, district)` and on `ulpin`. Duplicate records are flagged and logged in `IngestionBatch.errors_json`.
5. **PII Protection**:
   * *Rule*: 12-digit Aadhaar numbers and 10-digit mobile numbers are automatically masked (`XXXXXXXX1234`) and hashes (`owner_aadhar_hash`) stored instead.
6. **Transaction Rollback**:
   * *Rule*: Batch imports commit only on complete validation or record partial status with an audit log in `ingestion_batches`.

---

## 7. Future State Connector Guide (National Extensibility)

The platform supports adding new states without changing existing database models or endpoints:

```python
from app.domain.services.ingestion.base_connector import BaseStateConnector

class MaharashtraConnector(BaseStateConnector):
    def __init__(self):
        super().__init__(
            state_code="MH",
            state_name="Maharashtra",
            default_source_system="MAHA_BHULEKH"
        )

    def validate_bounds(self, lat: float, lng: float) -> bool:
        # Bounding box for Maharashtra: Lat [15.6, 22.0], Lng [72.6, 80.9]
        return (15.6 <= lat <= 22.0) and (72.6 <= lng <= 80.9)

    def normalize_record(self, raw_data: dict, provenance_type: str = "REAL") -> dict:
        # Map 7/12 (Saat-Baara) extract fields (Gut No, Survey No, Pote-Hissa)
        # to canonical Khasra, Area in Acres, and ULPIN.
        ...
```

---

## 8. Team Handoff Interfaces

### For Salmon Angelo (ML / LLM Specialist — D2, D5, D6)
* **Access Endpoint**: `GET /api/v1/canonical/trace/{identifier}`
* **Normalized Data Provided**: Clean, sanitized legal text, case numbers, dispute categories, land-use classifications, and historical mutation dates for RAG indexing and econometric policy simulations.
* **Filter by Provenance**: Filter queries using `provenance_type="REAL"` or `"CURATED"` to guarantee zero hallucinated ground-truth data in prompt context.

### For Nithin Pranav (GIS & Dashboard Full-Stack — D4, D10)
* **Access Endpoints**:
  * `GET /api/v1/canonical/hierarchy`: Clean GeoJSON boundaries for all 11 Delhi districts and 30+ municipal wards.
  * `GET /api/v1/parcels/`: Fully backward-compatible parcel list with `geojson_polygon`, `lat`, `lng`, `dispute_risk_score`, and `climate_vulnerability_index`.
* **Zero Breaking Changes**: All original fields (`khasra_no`, `area_acres`, `land_use`, `owner_name`, `lat`, `lng`) maintain original types, names, and nullability.

---

## 9. API Ingestion Endpoints Reference

### Ingestion Endpoints (D7)
* `POST /api/v1/ingestion/geojson`: Ingest GeoJSON FeatureCollection with spatial validation.
* `POST /api/v1/ingestion/csv-parcels`: Ingest CSV of cadastral records.
* `POST /api/v1/ingestion/disputes-json`: Ingest structured dispute dockets with automatic parcel foreign key linking.
* `POST /api/v1/ingestion/order-document`: Parse and ingest court orders / legal notices.
* `POST /api/v1/ingestion/seed-delhi-assets`: Ingest official Delhi GeoJSON layers from frontend assets.

### Canonical & Interoperability Endpoints (D12)
* `GET /api/v1/canonical/trace/{identifier}`: Trace `Parcel → Administrative Hierarchy → Linked Disputes`.
* `GET /api/v1/canonical/hierarchy`: Returns full multi-tier administrative tree with geometry status.
* `GET /api/v1/canonical/provenance`: Data quality metrics, ULPIN coverage, and batch ingestion audit logs.
* `POST /api/v1/canonical/validate`: Dry-run validation check for incoming GeoJSON or tabular payloads.
