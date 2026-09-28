import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_parcels_contract_preserved():
    """Verify GET /api/v1/parcels/ retains exact backward compatibility for frontend."""
    res = client.get("/api/v1/parcels/")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 6

    # Verify all original contract fields exist
    first = data[0]
    required_fields = [
        "id", "khasra_no", "village", "taluka", "district", "state",
        "area_acres", "land_use", "owner_name", "title_status",
        "svamitva_issued", "is_digitized", "lat", "lng",
        "dispute_risk_score", "climate_vulnerability_index"
    ]
    for field in required_fields:
        assert field in first, f"Missing original field '{field}' in LandParcel response"


def test_get_single_parcel_contract():
    """Verify GET /api/v1/parcels/{id} returns parcel with correct data types."""
    res = client.get("/api/v1/parcels/1")
    assert res.status_code == 200
    parcel = res.json()
    assert parcel["id"] == 1
    assert parcel["khasra_no"] == "104/1A"
    assert isinstance(parcel["area_acres"], float)
    assert isinstance(parcel["lat"], float)
    assert isinstance(parcel["lng"], float)


def test_list_disputes_contract_preserved():
    """Verify GET /api/v1/disputes/ retains exact backward compatibility for frontend."""
    res = client.get("/api/v1/disputes/")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 4

    first = data[0]
    required_dispute_fields = [
        "id", "case_number", "khasra_no", "district", "state",
        "court_type", "title", "description", "dispute_category",
        "status", "filing_date", "estimated_value_lakhs",
        "plaintiff", "defendant", "risk_level"
    ]
    for field in required_dispute_fields:
        assert field in first, f"Missing original field '{field}' in DisputeCase response"


def test_get_single_dispute_contract():
    """Verify GET /api/v1/disputes/{id} returns dispute case."""
    res = client.get("/api/v1/disputes/1")
    assert res.status_code == 200
    case = res.json()
    assert case["id"] == 1
    assert case["case_number"] == "REV/2026/DL-4912"
    assert case["khasra_no"] == "218/3B"
