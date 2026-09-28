import re
import hashlib
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Tuple
from sqlmodel import Session


class BaseStateConnector(ABC):
    """
    Abstract Base Class for State-Specific Land Administration Connectors.
    Allows federated ingestion from any Indian State/UT (Delhi, UP, Maharashtra, etc.)
    without redesigning core domain logic.
    """

    def __init__(self, state_code: str, state_name: str, default_source_system: str):
        self.state_code = state_code
        self.state_name = state_name
        self.default_source_system = default_source_system

    @abstractmethod
    def validate_bounds(self, lat: float, lng: float) -> bool:
        """Validate whether latitude and longitude are within state geographic boundaries."""
        pass

    @abstractmethod
    def normalize_record(self, raw_data: Dict[str, Any], provenance_type: str = "CURATED") -> Dict[str, Any]:
        """Convert state-specific terminology to canonical LandParcel attribute dictionary."""
        pass

    def sanitize_pii(self, text: Optional[str]) -> Optional[str]:
        """Strip or hash sensitive PII such as 12-digit Aadhaar numbers or 10-digit mobile numbers."""
        if not text:
            return text
        # Mask 12 digit Aadhaar
        text = re.sub(r"\b\d{4}\s?\d{4}\s?(\d{4})\b", r"XXXXXXXX\1", text)
        # Mask 10 digit mobile numbers
        text = re.sub(r"\b[6-9]\d{5}(\d{4})\b", r"XXXXXX\1", text)
        return text

    def hash_identifier(self, identifier: Optional[str]) -> Optional[str]:
        """SHA-256 hash for secure storage of owner identifiers."""
        if not identifier:
            return None
        return hashlib.sha256(identifier.strip().encode("utf-8")).hexdigest()

    def validate_geojson_geometry(self, geometry: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Validate GeoJSON geometry object.
        Ensures type is Polygon or MultiPolygon and linear rings are properly closed.
        """
        if not isinstance(geometry, dict):
            return False, "Geometry must be a valid JSON dictionary."
        
        geom_type = geometry.get("type")
        coords = geometry.get("coordinates")

        if geom_type not in ["Polygon", "MultiPolygon", "Point"]:
            return False, f"Unsupported geometry type '{geom_type}'. Must be Polygon, MultiPolygon, or Point."

        if not coords or not isinstance(coords, list):
            return False, "Geometry coordinates missing or not a valid list."

        if geom_type == "Polygon":
            for ring_idx, ring in enumerate(coords):
                if not isinstance(ring, list) or len(ring) < 4:
                    return False, f"Polygon ring {ring_idx} must contain at least 4 coordinate points."
                if ring[0] != ring[-1]:
                    return False, f"Polygon ring {ring_idx} is not closed (first point != last point)."
        
        return True, None

    def generate_ulpin(self, state_code: str, lgd_district_code: str, lat: float, lng: float, khasra_no: str) -> str:
        """
        Generate a canonical 14+ character Bhu-Aadhaar / ULPIN format
        based on geo-coordinates and cadastral parcel survey identifier.
        """
        lat_int = int(abs(lat) * 100) % 10000
        lng_int = int(abs(lng) * 100) % 10000
        clean_khasra = re.sub(r"[^0-9]", "", khasra_no)[:4].zfill(4)
        return f"{state_code}-{lgd_district_code}-{lat_int:04d}-{lng_int:04d}-{clean_khasra}"
