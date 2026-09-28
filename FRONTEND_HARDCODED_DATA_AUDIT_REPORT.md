# FRONTEND HARDCODED DATA AUDIT & BACKEND INTEGRATION REPORT
## LandGov / Bhumi-Gyan (SIH 26019)
**Author**: Backend / Data Architecture Specialist (Pavithran)  
**Date**: September 28, 2026  
**Target Repository**: `LandGov-Platform/frontend` & `LandGov-Platform/backend`  
**Associated Branch**: `pavithran-day1`

---

## 1. Executive Summary

This report provides a complete, line-by-line audit of all **hardcoded, mocked, and static data** currently present in the Next.js frontend application (`LandGov-Platform/frontend`), along with exact, actionable migration guides and architectural adapters to wire each component to the newly created and verified backend endpoints.

### Context & Current State
* The backend (`LandGov-Platform/backend`) on branch `pavithran-day1` is now fully operational on port `8000`.
* It provides 28 active endpoints, including:
  * Canonical parcel retrieval: `GET /api/v1/parcels/` and `GET /api/v1/parcels/{id}`
  * Full-chain traceability: `GET /api/v1/canonical/trace/{identifier}`
  * Multi-tier administrative hierarchy: `GET /api/v1/canonical/hierarchy`
  * Provenance & data quality telemetry: `GET /api/v1/canonical/provenance`
  * Multi-source ingestion: `POST /api/v1/ingestion/*` (GeoJSON, CSV, Disputes, Court Orders)
  * Repository & Innovation: `/api/v1/repository/papers`, `/api/v1/repository/policies`, `/api/v1/innovation/items`
* However, the frontend is currently running in **decoupled mock mode**, relying on static TypeScript arrays and offline Zustand stores located in `src/lib/data/`.
* Below is the complete catalog of hardcoded data and the blueprint for connecting them to the live backend.

---

## 2. Comprehensive Catalog of Hardcoded Data

### 2.1 Mock Data Files (`src/lib/data/`)

| File Path | Hardcoded Constants | Current Content & Observations |
| :--- | :--- | :--- |
| `src/lib/data/mock-parcels.ts` | `MOCK_PARCELS` (233 lines) | 5 hardcoded parcels (`ba-unit-dl-01` to `ba-unit-dl-05`). Contains simulated LADM structures (`LA_BAUnit`), hardcoded coordinates in Alipur, and some residual references to Pune (`27250100440021`). |
| `src/lib/data/mock-metrics.ts` | `NATIONAL_DILRMP_METRICS`, `STATE_GOVERNANCE_DATA` (92 lines) | Static statistics (e.g. `'32.4 Crore'`, `'₹8.4 Lakh Crore'`) and hardcoded state tables for Maharashtra, Karnataka, Telangana, and UP. |
| `src/lib/data/delhi-data.ts` | `DELHI_DISTRICTS_DATA`, `MOCK_VOLUNTEERS` (178 lines) | Hardcoded numbers for Delhi's 11 districts (e.g. `volunteersTotal: 10`, `coveredWards: 14`, `coveragePct: 60`). |
| `src/lib/data/mock-sources.ts` | `INITIAL_NOTEBOOK_SOURCES` (100 lines) | 3 hardcoded file entries: `Delhi_NCT_Wardwise_Cadastral_Boundaries_2026.geojson`, `Delhi_Revenue_Khatauni_Khasra_Registers_Batch.json`, `Delhi_High_Court_RCCMS_Judgments_Corpus.pdf`. |
| `src/lib/data/mock-scenarios.ts` | `MOCK_SCENARIOS` (132 lines) | 3 static policy simulation scenarios: `SVAMITVA Full Saturation`, `DILRMP 3.0 Conclusive Titling Fast-Track`, `Strict Agricultural Land Conservation`. |

---

### 2.2 Hardcoded State Stores (`src/lib/stores/`)

| Store File | Hardcoded Initialization | Issues & Gaps |
| :--- | :--- | :--- |
| `src/lib/stores/use-spatial-store.ts` | • `parcels: MOCK_PARCELS`<br>• `selectedUlpin: '27250100440021'`<br>• `mapCenter: [18.5784, 73.9852]` (Pune) | • Does not fetch live parcels from backend.<br>• Default map center is set to Wagholi, Pune instead of Delhi (`[28.6139, 77.2090]`).<br>• Initial selected ULPIN is from Maharashtra. |
| `src/lib/stores/use-notebook-sources.ts` | • `sources: INITIAL_NOTEBOOK_SOURCES`<br>• `addSource`: creates mock client-side ID `src-custom-${Date.now()}` | Uploading a document only adds it to local React state; it never calls `POST /api/v1/ingestion/*` or stores it in SQLite. |
| `src/lib/stores/use-simulation-store.ts` | • `scenarios: MOCK_SCENARIOS`<br>• `activeScenarioId: 'scen-svamitva-full'` | Uses hardcoded transition matrices without calling `POST /api/v1/simulation/run`. |

---

### 2.3 Hardcoded Page Components (`src/app/(dashboard)/`)

| Page File | Hardcoded Data Structures | Lines |
| :--- | :--- | :---: |
| `src/app/(dashboard)/page.tsx` (Dashboard Overview) | `RESEARCH_DOMAINS`: 11 Delhi districts with static paper counts, dispute numbers, and coverage percentages. | Lines 17–29 |
| `src/app/(dashboard)/data-repository/page.tsx` | `DATASETS`: 8 hardcoded static cards with mock file sizes, view counts, and download links. | Lines 9–18 |
| `src/app/(dashboard)/research-lab/page.tsx` | `WORKSPACES`: 4 static research notebooks (`ws-001` to `ws-004`). | Lines 6–50 |
| `src/app/(dashboard)/innovation-hub/page.tsx` | `HACKATHON_PROBLEMS` & `SANDBOX_DATASETS`: 2 static challenge entries and 2 static datasets. | Lines 23–60 |
| `src/app/(dashboard)/knowledge-hub/page.tsx` | `KNOWLEDGE_ITEMS`: 6 hardcoded policy briefs, papers, and case studies. | Lines 8–60 |

---

### 2.4 Hardcoded UI Components (`src/components/`)

| Component File | Hardcoded Behavior | Lines |
| :--- | :--- | :---: |
| `src/components/layout/ulpin-quick-search.tsx` | Filters against local `useSpatialStore.parcels` memory array rather than calling backend search or trace API. | Lines 13–21 |
| `src/components/spatial/map-canvas.tsx` | Hardcoded SVG projection centering around Wagholi, Pune `[18.5784, 73.9852]`. | Lines 41–50 |
| `src/components/risk/litigation-timeline.tsx` | Hardcoded mock case filings from 2018–2025 instead of reading `DisputeCase` entries linked to the active parcel. | Lines 30–65 |
| `src/components/sources/upload-source-dialog.tsx` | Generates simulated ingestion progress (`setTimeout`) and fake chunk tokens without calling backend ingestion endpoints. | Lines 45–80 |

---

## 3. Mapping: Frontend Components to Live Backend Endpoints

| Frontend Feature / Component | Current Hardcoded Source | Target Live Backend Endpoint | HTTP Method |
| :--- | :--- | :--- | :---: |
| **All Parcels on Map & GIS Studio** | `MOCK_PARCELS` in `use-spatial-store.ts` | `/api/v1/parcels/` | `GET` |
| **ULPIN & Khasra Search** | Local array filter in `ulpin-quick-search.tsx` | `/api/v1/canonical/trace/{identifier}` | `GET` |
| **LADM Entity Inspector** | `LA_BAUnit` properties in `mock-parcels.ts` | `/api/v1/canonical/trace/{identifier}` | `GET` |
| **Disputes & Litigation Timeline** | Mock history in `litigation-timeline.tsx` | `/api/v1/canonical/trace/{identifier}` or `/api/v1/disputes/?khasra_no={khasra}` | `GET` |
| **Delhi Administrative Hierarchy** | Hardcoded `DELHI_DISTRICTS_DATA` | `/api/v1/canonical/hierarchy?state_code=DL` | `GET` |
| **National Governance KPI Cards** | `NATIONAL_DILRMP_METRICS` in `mock-metrics.ts` | `/api/v1/canonical/provenance` & `/api/v1/analytics/summary` | `GET` |
| **Data Repository Dataset List** | `DATASETS` in `data-repository/page.tsx` | `/api/v1/canonical/provenance` + `/api/v1/repository/policies` | `GET` |
| **Source Upload & File Ingestion** | Local state in `upload-source-dialog.tsx` | `/api/v1/ingestion/geojson` or `/api/v1/ingestion/csv-parcels` | `POST` |
| **Research Lab Publications** | `WORKSPACES` in `research-lab/page.tsx` | `/api/v1/repository/papers` | `GET` |
| **Innovation Hub Challenges** | `HACKATHON_PROBLEMS` in `innovation-hub/page.tsx`| `/api/v1/innovation/items` | `GET` |
| **Policy "What-If" Simulation** | `MOCK_SCENARIOS` in `use-simulation-store.ts` | `/api/v1/simulation/run` | `POST` |

---

## 4. Step-by-Step "How to Change It" Guide

### Step 1: Create a Central API Client Helper (`src/lib/api.ts`)
Instead of duplicating fetch logic across components, create a typed API gateway helper:

```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function fetchFromAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `API request failed with status ${res.status}`);
  }

  return res.json();
}
```

---

### Step 2: DTO Adapter: Mapping Backend `LandParcel` to Frontend `LA_BAUnit`
The backend returns canonical `LandParcel` objects. The frontend expects `ParcelWithRisk` (`LA_BAUnit & { riskProfile: ParcelRiskProfile }`). Use an adapter function:

```typescript
// src/lib/adapters/parcel-adapter.ts
import { LandParcelBackend, CanonicalTraceResponse } from '../types/backend';
import { ParcelWithRisk } from '../stores/use-spatial-store';

export function mapBackendParcelToFrontend(p: LandParcelBackend): ParcelWithRisk {
  const parsedCoords = p.geojson_polygon ? JSON.parse(p.geojson_polygon) : [];
  
  return {
    uID: `ba-unit-dl-${p.id}`,
    ulpin: p.ulpin || `0700000000${p.id}`,
    name: `Khasra No. ${p.khasra_no} - ${p.village}`,
    type: 'basicPropertyUnit',
    titleStatus: p.title_status === 'Disputed' ? 'ContestedLitigation' : 'ClearTitle',
    tfiScore: p.dispute_risk_score / 100,
    revenueVillage: p.village,
    tehsil: p.taluka,
    district: p.district,
    state: p.state,
    lastMutationDate: p.last_mutation_date || '2024-01-01',
    parties: [
      {
        id: `pty-${p.id}`,
        name: p.owner_name,
        type: 'naturalPerson',
        role: 'Bhumidhar',
        nationalIdMasked: 'XXXX-XXXX-XXXX',
        sharePercentage: 100,
        jurisdiction: p.taluka,
      },
    ],
    rrrs: [],
    spatialUnits: [
      {
        suID: `su-${p.id}`,
        ulpin: p.ulpin || '',
        surveyNumber: p.khasra_no,
        villageCode: `DL-${p.village.toUpperCase().slice(0, 3)}`,
        declaredAreaSqM: p.area_acres * 4046.86,
        gisCalculatedAreaSqM: p.area_acres * 4046.86,
        areaDiscrepancyPercentage: 0.0,
        boundaryType: 'cadastral',
        coordinates: parsedCoords,
        disputeZones: [],
      },
    ],
    riskProfile: {
      ulpin: p.ulpin || '',
      surveyNumber: p.khasra_no,
      village: `${p.village}, ${p.district}`,
      tfiScore: p.dispute_risk_score / 100,
      riskCategory: p.dispute_risk_score > 60 ? 'High_Fragile' : 'Low_Stable',
      components: {
        dSpatial: 0.2,
        lRccms: p.dispute_risk_score / 100,
        mGap: 0.1,
        eMortgage: 0.2,
        jEntropy: 0.3,
      },
      weights: { wSpatial: 0.25, wRccms: 0.3, wMutGap: 0.15, wMortgage: 0.15, wEntropy: 0.15 },
    },
  };
}
```

---

### Step 3: Hydrate `useSpatialStore` from Live Backend
Update `src/lib/stores/use-spatial-store.ts` to add an async `fetchParcels` action:

```typescript
// Add to SpatialState interface:
fetchParcels: () => Promise<void>;

// Add inside create<SpatialState>((set, get) => ({
fetchParcels: async () => {
  try {
    const data = await fetchFromAPI<LandParcelBackend[]>('/parcels/');
    const adapted = data.map(mapBackendParcelToFrontend);
    set({
      parcels: adapted,
      // Default to Delhi center instead of Pune!
      mapCenter: [28.6139, 77.2090],
      zoomLevel: 12,
      selectedUlpin: adapted[0]?.ulpin || null,
    });
  } catch (error) {
    console.error('Failed to load parcels from backend, falling back to mock:', error);
  }
},
```

---

### Step 4: Wire `ULPINQuickSearch` to Live Backend Trace Endpoint
In `src/components/layout/ulpin-quick-search.tsx`, replace the local filter with a debounced backend search:

```typescript
// Replace lines 13-21 with:
const [results, setResults] = useState<any[]>([]);

useEffect(() => {
  if (!query.trim()) {
    setResults([]);
    return;
  }
  
  const timer = setTimeout(async () => {
    try {
      // Calls canonical trace endpoint which supports Khasra, ULPIN, or ID
      const trace = await fetchFromAPI<CanonicalTraceResponse>(`/canonical/trace/${encodeURIComponent(query.trim())}`);
      if (trace && trace.parcel) {
        setResults([trace]);
      }
    } catch {
      setResults([]);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [query]);
```

---

### Step 5: Wire `UploadSourceDialog` to Multi-Source Ingestion API
In `src/components/sources/upload-source-dialog.tsx`, when a user drops a `.geojson` or `.csv` file, send the actual payload to the backend:

```typescript
// In handleUpload function:
const formData = new FormData();
if (file.name.endsWith('.geojson')) {
  const jsonContent = JSON.parse(await file.text());
  const res = await fetchFromAPI('/ingestion/geojson', {
    method: 'POST',
    body: JSON.stringify({
      source_system: 'WEB_UPLOADER',
      provenance_type: 'REAL',
      geojson: jsonContent
    })
  });
  alert(`Ingested ${res.records_ingested} parcels successfully!`);
} else if (file.name.endsWith('.csv')) {
  const csvContent = await file.text();
  const res = await fetchFromAPI('/ingestion/csv-parcels', {
    method: 'POST',
    body: JSON.stringify({
      csv_content: csvContent,
      source_system: 'WEB_CSV_UPLOADER'
    })
  });
  alert(`Ingested ${res.records_ingested} CSV records successfully!`);
}
```

---

### Step 6: Fix SVG Map Centering (`map-canvas.tsx`)
In `src/components/spatial/map-canvas.tsx`, lines 41–48:

```typescript
// BEFORE: Hardcoded to Pune
const centerLat = mapCenter[0]; // 18.5784
const centerLng = mapCenter[1]; // 73.9852

// AFTER: Dynamic based on selected parcel or Delhi NCT centroid [28.6139, 77.2090]
const centerLat = mapCenter[0] || 28.6139;
const centerLng = mapCenter[1] || 77.2090;
```

---

## 5. Prioritized TO-DO Checklist for Frontend Team

### Phase 1: High Priority (Core Land Governance Flow)
- [ ] **TO-DO 1.1**: Create `src/lib/api.ts` with `fetchFromAPI` helper pointing to `http://127.0.0.1:8000/api/v1`.
- [ ] **TO-DO 1.2**: Create `src/lib/adapters/parcel-adapter.ts` to convert backend `LandParcel` to frontend `LA_BAUnit`.
- [ ] **TO-DO 1.3**: Add `fetchParcels()` to `use-spatial-store.ts` and call it in a `useEffect` inside `src/app/(dashboard)/layout.tsx` or `gis-studio/page.tsx`.
- [ ] **TO-DO 1.4**: Update default `mapCenter` in `use-spatial-store.ts` and `map-canvas.tsx` from Wagholi Pune `[18.5784, 73.9852]` to Delhi NCT `[28.6139, 77.2090]`.
- [ ] **TO-DO 1.5**: Wire `ulpin-quick-search.tsx` to `GET /api/v1/canonical/trace/{query}` to enable live search for `218/3B`, `104/1A`, and ULPINs.

### Phase 2: Medium Priority (Litigation, Provenance & Ingestion)
- [ ] **TO-DO 2.1**: Connect `src/components/risk/litigation-timeline.tsx` to fetch dispute dockets from `GET /api/v1/disputes/?khasra_no={khasra}` or `trace.dispute_cases`.
- [ ] **TO-DO 2.2**: Connect `src/components/sources/upload-source-dialog.tsx` to call `POST /api/v1/ingestion/geojson` and `POST /api/v1/ingestion/csv-parcels`.
- [ ] **TO-DO 2.3**: Update `src/app/(dashboard)/data-repository/page.tsx` to display real batch records and metrics from `GET /api/v1/canonical/provenance`.
- [ ] **TO-DO 2.4**: Wire `src/components/campaign/district-coverage-list.tsx` to use live counts from `GET /api/v1/canonical/hierarchy?state_code=DL`.

### Phase 3: Lower Priority (Repository, Innovation & RAG)
- [ ] **TO-DO 3.1**: Fetch live research publications in `src/app/(dashboard)/research-lab/page.tsx` from `GET /api/v1/repository/papers`.
- [ ] **TO-DO 3.2**: Fetch hackathons and innovation challenges in `src/app/(dashboard)/innovation-hub/page.tsx` from `GET /api/v1/innovation/items`.
- [ ] **TO-DO 3.3**: Connect `src/app/(dashboard)/knowledge-hub/page.tsx` to `GET /api/v1/repository/policies`.
- [ ] **TO-DO 3.4**: Connect the policy simulator in `src/app/(dashboard)/simulation/page.tsx` to `POST /api/v1/simulation/run`.
