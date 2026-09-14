# Frontend Technical Specification: National Digital Land Governance & Research Platform

## 1. Architectural Paradigm: NotebookLM-Meets-Spatial Studio
The frontend architecture blends an AI research canvas (inspired by Google NotebookLM) with a spatial analytics workbench. Instead of presenting a standard administrative portal, the interface operates as an active research studio structured into a three-pane layout:

- **Left Rail (Sidebar)**: System navigation, administrative tier selectors, and the active "Notebook Sources" Drawer (cadastral layers, statutory codes, court dockets, and research datasets).
- **Center Canvas (SidebarInset)**: The primary analytical stage, supporting dynamic switching between an edge-to-edge WebGIS viewer, the Geo-CPSS policy simulation sandbox, and computational research notebooks.
- **Right Drawer (InspectorPanel)**: A contextual slide-over surface hosting domain-specific RAG synthesis, source citations, and ISO 19152 Land Administration Domain Model (LADM) parcel metadata inspection.

---

## 2. "Notebook Sources" Subsystem Specification
The Notebook Sources panel replicates the source-grounded interaction model of NotebookLM. Researchers and policy analysts can select, inspect, and toggle heterogeneous data sources that constrain the platform's analytical and AI synthesis engines.

### 2.1 Supported Source Modalities
- **Spatial Cadastral Layers**: GeoJSON, Shapefiles, GeoParquet files, and WFS feeds containing digitized parcel boundaries.
- **Textual Land Records**: Machine-readable Records of Rights (RoRs) and mutation registers fetched via state APIs.
- **Judicial & Dispute Dockets**: Unstructured or semi-structured orders from the Revenue Court Case Management System (RCCMS) and district civil courts.
- **Statutory & Policy Documents**: State Land Revenue Codes, the Registration Act of 1908, NITI Aayog Model Land Titling Acts, and gazette notifications.
- **Earth Observation Rasters**: Cloud Optimized GeoTIFFs (COGs) of Sentinel-2 multi-spectral bands, Landsat indices, and SVAMITVA/NAKSHA high-resolution ortho-rectified imagery (ORI).

### 2.2 Source Item Data Schema
```typescript
export type SourceModality = 'cadastre' | 'textual_ror' | 'litigation' | 'statute' | 'raster';

export interface NotebookSource {
  id: string;
  name: string;
  modality: SourceModality;
  geographicScope: {
    state: string;
    district: string;
    tehsil?: string;
    village?: string;
    ulpin?: string;
  };
  fileSize: string;
  tokenCount?: number;
  featureCount?: number;
  indexedStatus: 'ready' | 'processing' | 'error';
  isSelected: boolean;
  metadata: {
    sourceAuthority: string;
    ingestionTimestamp: string;
    crs?: string; // e.g., 'EPSG:4326'
    checksum: string;
  };
}
```

### 2.3 Source Drawer UX Mechanics
- **Selective Context Grounding**: Every source has a selection toggle. When ticked, the source is mounted into the active RAG vector context and the PostGIS spatial query session.
- **Source Attribution Badges**: When the AI Assistant synthesizes legal risks or policy implications, it renders hyperlinked inline citations that open the exact page of the court order or highlight the relevant cadastral parcel on the map canvas.
- **Dynamic Chunk Inspection**: Clicking a source card in the sidebar opens a sheet showing raw chunks, token allocations, and georeferenced coordinates.

---

## 3. UI Component Hierarchy & Layout Tree
The application is structured using shadcn/ui composable primitives, utilizing `SidebarProvider` to coordinate state across mobile and desktop breakpoints.

### Component Tree Breakdown
```
AppShell (SidebarProvider)
├── AppSidebar (Sidebar, variant="inset", collapsible="icon")
│   ├── SidebarHeader
│   │   ├── WorkspaceSwitcher (TeamSwitcher primitive: Central DoLR, State Revenue Department, Academic Research Lab)
│   │   └── ULPINQuickSearch (Quick input bar for 14-digit Bhu-Aadhaar lookup)
│   ├── SidebarContent
│   │   ├── SidebarGroup (Platform Workflows)
│   │   │   └── SidebarMenu
│   │   │       ├── Overview Dashboard (lucide-react: LayoutDashboard)
│   │   │       ├── Geo-CPSS Simulation Sandbox (lucide-react: SlidersHorizontal)
│   │   │       ├── Bhu-Nyaya Risk Triangulation (lucide-react: ShieldAlert)
│   │   │       ├── Conclusive Titling Evaluator (lucide-react: FileCheck)
│   │   │       └── Research Grant & Innovation Hub (lucide-react: Award)
│   │   └── SidebarGroup (Notebook Sources Tray)
│   │       ├── SidebarGroupLabel: "Active Research Sources" (with source counter and "Add Source" action)
│   │       └── SourcesList: Scrollable list of SourceCard items (checkboxes, modality icons, status indicators)
│   ├── SidebarFooter
│   │   └── NavUser: Profile management, role indicator (e.g., Title Registration Officer), theme settings
│   └── SidebarRail: Interactive drag handle for resizing the navigation rail width
│
└── SidebarInset (Main Stage Viewport)
    ├── SiteHeader
    │   ├── SidebarTrigger: Expands/collapses sidebar (Cmd+B shortcut)
    │   ├── Separator (orientation="vertical")
    │   ├── Breadcrumbs: Dynamic navigation path (National > Maharashtra > Pune > Haveli Tehsil)
    │   └── HeaderActions: Share simulation state, export research dossier (PDF/GeoJSON), toggle right inspector
    │
    ├── MainCanvasViewport (Controlled via react-resizable-panels)
    │   ├── Pane A (Visual Stage): MapLibre / CesiumJS 3D cadastral viewer or PLUS simulation raster diff canvas
    │   └── Pane B (Analytical Data Canvas): Data tables, title fragility breakdowns, interactive causal sensitivity charts
    │
    └── RightInspectorPanel (Sheet or Resizable Side-Panel)
        ├── NotebookAICopilot: Chat interface grounded strictly in active "Notebook Sources"
        └── LADMEntityInspector: Granular attribute breakdown (LA_Party, LA_RRR, LA_BAUnit)
```

---

## 4. Key Functional Views & Specifications

### 4.1 Geo-CPSS Simulation Sandbox Interface
| Sub-View Region | Component Used | Interactive Capability |
| :--- | :--- | :--- |
| **Top Filter Bar** | `Select`, `Slider`, `DateRangePicker` | Sets simulation horizon (5, 10, 20 years), targeted policy intervention, and zoning constraints. |
| **Comparative Map View** | MapLibre Split Screen (`maplibre-gl-compare`) | Left canvas displays baseline land use; right canvas displays simulated land transition under the proposed policy. |
| **Causal Effects Panel** | `Card`, Recharts Line/Area charts | Displays isolated Average Treatment Effects ($\tau$) computed via Double Machine Learning for land value and disputes. |
| **Inertia Matrix Control** | `Table`, `Input` | Allows policy researchers to manually override transition cost matrices between land categories. |

### 4.2 Bhu-Nyaya Risk Triangulation Interface
The Bhu-Nyaya interface focuses on the automated calculation of the **Title Fragility Index (TFI)**:

$$TFI = w_1 \cdot D_{\text{spatial}} + w_2 \cdot L_{\text{rccms}} + w_3 \cdot M_{\text{gap}} + w_4 \cdot E_{\text{mortgage}} + w_5 \cdot J_{\text{entropy}}$$

- **Diffeomorphic Boundary Diff Viewer**: An interactive canvas overlaying the vectorized revenue map boundary ($\mathcal{P}_{\text{cad}}$, rendered in blue) with the drone photogrammetry boundary ($\mathcal{P}_{\text{phys}}$, rendered in orange). Discrepancy areas are highlighted with red hatched patterns.
- **Litigation Timeline Stream**: A vertical chronological list of registered mutations, mortgage attachments, and RCCMS dispute filings.
- **Action Footer**: A triage toolbar enabling Title Registration Officers to mark a parcel as **"Fast-Track for Conclusive Title"** ($TFI < 0.25$) or **"Route to LDRO Mediation"** ($TFI \ge 0.25$).

---

## 5. Technology Stack & Directory Blueprint

### 5.1 Frontend Technology Stack
- **Framework**: Next.js (App Router, React 19, TypeScript).
- **Layout & Navigation**: `@shadcn/ui` (`Sidebar`, `Inset`, `Resizable Panels`, `Sheet`, `Dialog`, `Popover`).
- **State Management**: `zustand` with persistence middleware for sidebar collapse states and active source selections.
- **Geospatial Engines**:
  - `maplibre-gl` (with `@deck.gl/react`) for 2D parcel vector tiles and choropleth rendering.
  - `cesium` / `@cesium/widgets` for 3D oblique photogrammetry and urban cadastral reality models (NAKSHA datasets).
- **Data Visualization**: `recharts` and `@tremor/react` for econometric graphs and policy indicators.
- **Icons & Animation**: `lucide-react` paired with `framer-motion` for transitions.

### 5.2 Application Directory Blueprint
```
src/
├── app/
│   ├── layout.tsx                     # Global RootLayout with SidebarProvider
│   ├── (dashboard)/
│   │   ├── page.tsx                   # Overview Dashboard
│   │   ├── simulation/
│   │   │   └── page.tsx               # Geo-CPSS Policy Sandbox
│   │   ├── risk-triangulation/
│   │   │   └── page.tsx               # Bhu-Nyaya TFI Engine
│   │   ├── conclusive-titling/
│   │   │   └── page.tsx               # Conclusive Titling Transition Tracker
│   │   └── innovation-hub/
│   │       └── page.tsx               # Hackathons & Grant Management
├── components/
│   ├── app-sidebar.tsx                # Primary retractable sidebar assembly
│   ├── nav-main.tsx                   # Main navigation menu links
│   ├── nav-sources.tsx                # "Notebook Sources" list and controls
│   ├── workspace-switcher.tsx         # Multi-tier administrative switcher
│   ├── nav-user.tsx                   # User profile and role management
│   ├── spatial/
│   │   ├── map-canvas.tsx             # MapLibre/Deck.gl base viewport
│   │   ├── layer-control.tsx          # Cadastral, satellite, and zoning layer toggles
│   │   └── boundary-diff-viewer.tsx   # Diffeomorphic boundary auditor
│   ├── simulation/
│   │   ├── parameter-slider.tsx       # PLUS simulation drivers
│   │   └── treatment-effects.tsx      # Causal DML output cards
│   ├── sources/
│   │   ├── source-card.tsx            # Individual source item with selection toggle
│   │   ├── upload-source-dialog.tsx   # Modal for adding GeoJSON/PDF/dockets
│   │   └── chunk-inspector.tsx        # Slide-over displaying tokenized chunks
│   └── ui/                            # Installed shadcn/ui components
│       ├── sidebar.tsx
│       ├── resizable.tsx
│       ├── sheet.tsx
│       └── tabs.tsx
├── hooks/
│   ├── use-sidebar.ts                 # Access expanded/collapsed/mobile state
│   ├── use-notebook-sources.ts        # Selected sources state store
│   └── use-spatial-query.ts           # PostGIS API hook for parcel queries
└── lib/
    ├── types/
    │   ├── ladm.ts                    # ISO 19152 TypeScript schemas
    │   └── sources.ts                 # Notebook sources definitions
    └── utils.ts
```

---

## 6. Design System Tokens & Styling Standards
The platform utilizes a data-dense design system suited for spatial information management:

### Background Colors
- **Application Canvas**: `bg-slate-50` (Light) / `bg-zinc-950` (Dark)
- **Sidebar & Inset Surfaces**: `bg-white` (Light) / `bg-zinc-900` (Dark)

### Accent Palette
- **Forest / Emerald (`#059669` / `#10B981`)**: Represents verified cadastral boundaries and sustainable land use.
- **Amber / Orange (`#D97706` / `#F59E0B`)**: Represents medium title fragility and conversion alert zones.
- **Crimson / Rose (`#DC2626` / `#F43F5E`)**: Highlights RCCMS litigation dockets, high-risk titles, and boundary overlaps.
- **Indigo / Cobalt (`#2563EB` / `#4F46E5`)**: Used for primary interface actions, active selections, and infrastructure layers.

### Typography
- **Primary & UI**: Clean sans-serif (`Inter` or `Geist Sans`)
- **Monospace**: `JetBrains Mono` for 14-digit Bhu-Aadhaar identifiers (ULPIN), coordinates, and cadastral survey numbers.
