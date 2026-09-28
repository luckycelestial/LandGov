import os
import json
import uuid
from typing import Dict, Any, List, Optional, Tuple
from sqlmodel import Session, select

from app.domain.models.land_gov import LandParcel, AdministrativeUnit, IngestionBatch
from app.domain.services.ingestion.base_connector import BaseStateConnector


class DelhiConnector(BaseStateConnector):
    """
    Delhi-specific connector implementation.
    Handles DORIS, Delhi GeoPortal, and Delhi District/Ward GeoJSON layers.
    """

    # NCT of Delhi bounding box
    MIN_LAT = 28.35
    MAX_LAT = 28.95
    MIN_LNG = 76.80
    MAX_LNG = 77.45

    DISTRICT_LGD_MAP = {
        "CENTRAL": "01",
        "EAST": "02",
        "NEW DELHI": "03",
        "NORTH": "04",
        "NORTH EAST": "05",
        "NORTH WEST": "06",
        "SHAHDARA": "07",
        "SOUTH": "08",
        "SOUTH EAST": "09",
        "SOUTH WEST": "10",
        "WEST": "11",
    }

    def __init__(self):
        super().__init__(
            state_code="DL",
            state_name="Delhi",
            default_source_system="DELHI_GEOPORTAL"
        )

    def validate_bounds(self, lat: float, lng: float) -> bool:
        return (self.MIN_LAT <= lat <= self.MAX_LAT) and (self.MIN_LNG <= lng <= self.MAX_LNG)

    def normalize_record(self, raw_data: Dict[str, Any], provenance_type: str = "CURATED") -> Dict[str, Any]:
        """
        Normalize arbitrary incoming Delhi cadastral data to canonical shape.
        Handles missing Khasra/ULPIN by retaining source ID and flagging is_resolved=False.
        """
        props = raw_data.get("properties", raw_data)
        geom = raw_data.get("geometry")

        # Extract or derive coordinates
        lat = props.get("lat") or props.get("latitude")
        lng = props.get("lng") or props.get("longitude")

        coords_json = None
        if geom:
            coords_json = json.dumps(geom.get("coordinates", []))
            if lat is None or lng is None:
                # Approximate centroid from geometry coordinates
                try:
                    c = geom.get("coordinates")
                    if geom.get("type") == "Polygon" and c and len(c[0]) > 0:
                        lngs = [pt[0] for pt in c[0]]
                        lats = [pt[1] for pt in c[0]]
                        lat = sum(lats) / len(lats)
                        lng = sum(lngs) / len(lngs)
                    elif geom.get("type") == "Point" and c:
                        lng, lat = c[0], c[1]
                except Exception:
                    lat, lng = 28.6139, 77.2090  # Delhi default fallback if unparseable
        
        lat = float(lat) if lat is not None else 28.6139
        lng = float(lng) if lng is not None else 77.2090

        # Extract Khasra / Survey identifier
        khasra = props.get("khasra_no") or props.get("khasra") or props.get("survey_no") or props.get("Ward_No") or props.get("mandal_code")
        is_resolved = True

        if not khasra:
            # Retain source record ID without fabricating false survey numbers
            source_rec_id = props.get("id") or props.get("source_record_id") or str(uuid.uuid4())[:8]
            khasra = f"UNRESOLVED-{source_rec_id}"
            is_resolved = False

        district = props.get("district") or props.get("dtname") or "New Delhi"
        if not district.endswith("Delhi") and not district.startswith("Delhi"):
            district = f"{district} Delhi" if district != "New Delhi" else district

        village = props.get("village") or props.get("Ward_Name") or props.get("mandal_name") or "Delhi Urban Locality"
        taluka = props.get("taluka") or props.get("tehsil") or district

        # ULPIN resolution
        district_clean = district.replace(" Delhi", "").strip().upper()
        lgd_code = self.DISTRICT_LGD_MAP.get(district_clean, "00")
        ulpin = props.get("ulpin")
        if not ulpin and is_resolved and khasra and not khasra.startswith("UNRESOLVED"):
            ulpin = self.generate_ulpin("DL", lgd_code, lat, lng, khasra)

        owner_name = self.sanitize_pii(props.get("owner_name") or props.get("owner") or "Government of NCT of Delhi / Municipal Corp")
        owner_id = props.get("owner_aadhar") or props.get("owner_id")

        return {
            "khasra_no": khasra,
            "ulpin": ulpin,
            "village": village,
            "taluka": taluka,
            "district": district,
            "state": "Delhi",
            "area_acres": float(props.get("area_acres") or props.get("area", 1.0)),
            "land_use": props.get("land_use") or "Government / Public Use",
            "owner_name": owner_name,
            "owner_aadhar_hash": self.hash_identifier(owner_id),
            "title_status": props.get("title_status") or "Clear",
            "svamitva_issued": bool(props.get("svamitva_issued", False)),
            "is_digitized": True,
            "lat": lat,
            "lng": lng,
            "dispute_risk_score": float(props.get("dispute_risk_score", 10.0)),
            "climate_vulnerability_index": float(props.get("climate_vulnerability_index", 20.0)),
            "last_mutation_date": props.get("last_mutation_date"),
            "geojson_polygon": coords_json,
            "source_state": "DL",
            "source_system": props.get("source_system", self.default_source_system),
            "source_record_id": str(props.get("source_record_id") or props.get("id") or khasra),
            "provenance_type": provenance_type,
            "is_resolved": is_resolved,
            "ward": props.get("Ward_No") or props.get("ward"),
            "constituency": props.get("constituency") or props.get("Constituency"),
        }

    def ingest_geojson(
        self,
        geojson_data: Dict[str, Any],
        session: Session,
        batch_id: Optional[str] = None,
        provenance_type: str = "REAL"
    ) -> Dict[str, Any]:
        """
        Validate and ingest GeoJSON FeatureCollection into LandParcel and AdministrativeUnit.
        Ensures rollback on severe failure, duplicate prevention, and detailed error logging.
        """
        if not batch_id:
            batch_id = f"BATCH-DL-{uuid.uuid4().hex[:8].upper()}"

        if not isinstance(geojson_data, dict):
            return {
                "success": False,
                "batch_id": batch_id,
                "error": "Invalid GeoJSON payload: Root must be a dictionary with 'type' and 'features'."
            }

        features = geojson_data.get("features", [])
        if not features and geojson_data.get("type") == "Feature":
            features = [geojson_data]

        if not features:
            return {
                "success": False,
                "batch_id": batch_id,
                "error": "No GeoJSON features found in payload."
            }

        records_total = len(features)
        records_ingested = 0
        records_failed = 0
        errors: List[Dict[str, Any]] = []

        batch = IngestionBatch(
            batch_id=batch_id,
            source_state="DL",
            source_system=self.default_source_system,
            records_total=records_total,
            provenance_type=provenance_type
        )
        session.add(batch)

        # Cache existing khasra+district to detect duplicates
        existing_keys = set(
            session.exec(select(LandParcel.khasra_no, LandParcel.district)).all()
        )

        for idx, feat in enumerate(features):
            try:
                # 1. Validate Geometry if present
                geom = feat.get("geometry")
                if geom:
                    is_valid_geom, geom_err = self.validate_geojson_geometry(geom)
                    if not is_valid_geom:
                        records_failed += 1
                        errors.append({"feature_index": idx, "reason": geom_err})
                        continue

                # 2. Normalize
                norm = self.normalize_record(feat, provenance_type=provenance_type)

                # 3. Validate Coordinates
                if not self.validate_bounds(norm["lat"], norm["lng"]):
                    records_failed += 1
                    errors.append({
                        "feature_index": idx,
                        "khasra_no": norm["khasra_no"],
                        "reason": f"Coordinates ({norm['lat']}, {norm['lng']}) fall outside NCT of Delhi boundaries."
                    })
                    continue

                # 4. Check Duplicate
                key = (norm["khasra_no"], norm["district"])
                if key in existing_keys:
                    # Update or skip duplicate
                    records_failed += 1
                    errors.append({
                        "feature_index": idx,
                        "khasra_no": norm["khasra_no"],
                        "reason": f"Duplicate parcel detected for Khasra '{norm['khasra_no']}' in district '{norm['district']}'."
                    })
                    continue

                # 5. Insert LandParcel
                parcel = LandParcel(**norm)
                session.add(parcel)
                existing_keys.add(key)
                records_ingested += 1

            except Exception as e:
                records_failed += 1
                errors.append({"feature_index": idx, "reason": str(e)})

        try:
            batch.records_ingested = records_ingested
            batch.records_failed = records_failed
            batch.status = "COMPLETED" if records_failed == 0 else ("PARTIAL" if records_ingested > 0 else "FAILED")
            if errors:
                batch.errors_json = json.dumps(errors[:50])
            session.commit()
        except Exception as e:
            session.rollback()
            return {
                "success": False,
                "batch_id": batch_id,
                "error": f"Database commit failed: {str(e)}"
            }

        return {
            "success": records_ingested > 0,
            "batch_id": batch_id,
            "records_total": records_total,
            "records_ingested": records_ingested,
            "records_failed": records_failed,
            "errors": errors[:20]
        }

    def seed_from_local_geojson_assets(self, session: Session, public_dir: str) -> Dict[str, Any]:
        """
        Ingest the 11 Delhi Districts and sample Wards from the frontend/public GeoJSON assets.
        Populates AdministrativeUnit with actual geometry boundaries.
        """
        results = {}
        districts_path = os.path.join(public_dir, "delhi_districts.geojson")
        if os.path.exists(districts_path):
            with open(districts_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                features = data.get("features", [])
                ingested = 0
                for feat in features:
                    props = feat.get("properties", {})
                    dtname = props.get("dtname", "Unknown")
                    code = f"DL-DIST-{dtname.upper().replace(' ', '')}"
                    geom_str = json.dumps(feat.get("geometry", {}))

                    unit = session.exec(select(AdministrativeUnit).where(AdministrativeUnit.code == code)).first()
                    if not unit:
                        unit = AdministrativeUnit(
                            unit_type="DISTRICT",
                            code=code,
                            name=f"{dtname} Delhi",
                            parent_code="DL",
                            state_code="DL",
                            geojson_boundary=geom_str,
                            source_system="DELHI_GEOPORTAL",
                            provenance_type="REAL"
                        )
                        session.add(unit)
                        ingested += 1
                    elif not unit.geojson_boundary:
                        unit.geojson_boundary = geom_str
                        session.add(unit)
                        ingested += 1
                session.commit()
                results["districts_ingested"] = ingested

        wards_path = os.path.join(public_dir, "delhi_wards.geojson")
        if os.path.exists(wards_path):
            with open(wards_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                features = data.get("features", [])
                ingested = 0
                # Ingest top 30 representative wards for MVP performance
                for feat in features[:30]:
                    props = feat.get("properties", {})
                    ward_no = props.get("Ward_No", "W0")
                    ward_name = props.get("Ward_Name", f"Ward {ward_no}")
                    code = f"DL-WARD-{ward_no.upper().replace(' ', '')}"
                    geom_str = json.dumps(feat.get("geometry", {}))

                    unit = session.exec(select(AdministrativeUnit).where(AdministrativeUnit.code == code)).first()
                    if not unit:
                        unit = AdministrativeUnit(
                            unit_type="WARD",
                            code=code,
                            name=ward_name,
                            parent_code="DL",
                            state_code="DL",
                            geojson_boundary=geom_str,
                            source_system="DELHI_MCD_PORTAL",
                            provenance_type="REAL"
                        )
                        session.add(unit)
                        ingested += 1
                session.commit()
                results["wards_ingested"] = ingested

        return results
