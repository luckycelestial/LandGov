import pytest
from app.domain.services.ingestion.base_connector import BaseStateConnector
from app.domain.models.land_gov import LandParcel, AdministrativeUnit


class MaharashtraConnector(BaseStateConnector):
    """Demonstrates modular federation: onboarding Maharashtra without altering core models."""
    def __init__(self):
        super().__init__(
            state_code="MH",
            state_name="Maharashtra",
            default_source_system="MAHA_BHULEKH"
        )

    def validate_bounds(self, lat: float, lng: float) -> bool:
        # Maharashtra geographic bounds
        return (15.60 <= lat <= 22.10) and (72.60 <= lng <= 80.90)

    def normalize_record(self, raw_data: dict, provenance_type: str = "REAL") -> dict:
        props = raw_data.get("properties", raw_data)
        lat = float(props.get("lat", 18.5204))
        lng = float(props.get("lng", 73.8567))
        # Maharashtra 7/12 extract uses 'Gut No' or 'Survey No'
        gut_no = props.get("gut_no") or props.get("survey_no") or "GUT-101"
        district = props.get("district", "Pune")
        
        ulpin = self.generate_ulpin("MH", "25", lat, lng, gut_no)
        return {
            "khasra_no": gut_no,
            "ulpin": ulpin,
            "village": props.get("village", "Haveli"),
            "taluka": props.get("taluka", "Pune City"),
            "district": district,
            "state": "Maharashtra",
            "area_acres": float(props.get("area_hectares", 1.0)) * 2.47105,  # Hectares to acres
            "land_use": props.get("land_use", "Agricultural"),
            "owner_name": self.sanitize_pii(props.get("owner_name", "Kisan Patil")),
            "owner_aadhar_hash": self.hash_identifier(props.get("aadhaar")),
            "title_status": "Clear",
            "lat": lat,
            "lng": lng,
            "source_state": "MH",
            "source_system": self.default_source_system,
            "provenance_type": provenance_type,
            "is_resolved": True
        }


def test_maharashtra_connector_extensibility():
    """Verify new state connector plugs directly into canonical LandParcel schema."""
    connector = MaharashtraConnector()
    assert connector.state_code == "MH"

    # Bounds validation
    assert connector.validate_bounds(18.5204, 73.8567) is True   # Pune
    assert connector.validate_bounds(28.6139, 77.2090) is False  # Delhi (out of bounds)

    raw_maha_record = {
        "gut_no": "45/2A",
        "district": "Pune",
        "taluka": "Haveli",
        "village": "Wagholi",
        "area_hectares": 2.0,
        "owner_name": "Sanjay Patil 9876543210",
        "aadhaar": "123456789012"
    }

    norm = connector.normalize_record(raw_maha_record)
    assert norm["khasra_no"] == "45/2A"
    assert norm["source_state"] == "MH"
    assert norm["source_system"] == "MAHA_BHULEKH"
    assert norm["ulpin"].startswith("MH-25-")
    assert "9876543210" not in norm["owner_name"]  # PII masked
    assert norm["owner_aadhar_hash"] is not None

    # Directly instantiable into canonical LandParcel
    parcel = LandParcel(**norm)
    assert parcel.state == "Maharashtra"
    assert parcel.area_acres == pytest.approx(4.9421, rel=1e-3)
