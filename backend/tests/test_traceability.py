import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_trace_parcel_by_khasra_with_disputes():
    """Verify complete parcel -> administration -> dispute trace using Khasra number."""
    res = client.get("/api/v1/canonical/trace/218/3B")
    assert res.status_code == 200
    data = res.json()

    # 1. Parcel verification
    assert data["parcel"]["khasra_no"] == "218/3B"
    assert data["parcel"]["title_status"] == "Disputed"
    assert data["parcel"]["ulpin"] == "DL-07-2860-7698-2183"

    # 2. Administrative hierarchy verification (State -> District -> Tehsil -> Village)
    admin = data["administrative_hierarchy"]
    assert admin["state"]["code"] == "DL"
    assert "Delhi" in admin["district"]["name"]
    assert admin["tehsil"]["unit_type"] == "TEHSIL"
    assert "Najafgarh" in admin["village_or_locality"]["name"]

    # 3. Linked dispute verification
    disputes = data["dispute_cases"]
    assert len(disputes) >= 1
    assert any(d["case_number"] == "REV/2026/DL-4912" for d in disputes)
    first_disp = disputes[0]
    assert first_disp["plaintiff"] == "Gram Panchayat Najafgarh"
    assert first_disp["defendant"] == "Kishan Lal Yadav"
    assert first_disp["risk_level"] == "High"

    # 4. Status flags
    assert data["trace_status"]["has_disputes"] is True
    assert data["trace_status"]["is_ulpin_verified"] is True


def test_trace_parcel_by_ulpin():
    """Verify trace works identically when queried by 14-character ULPIN."""
    res = client.get("/api/v1/canonical/trace/DL-07-2852-7718-1041")
    assert res.status_code == 200
    data = res.json()
    assert data["parcel"]["khasra_no"] == "104/1A"
    assert data["administrative_hierarchy"]["state"]["code"] == "DL"


def test_trace_parcel_by_id():
    """Verify trace works when queried by integer primary key."""
    res = client.get("/api/v1/canonical/trace/1")
    assert res.status_code == 200
    data = res.json()
    assert data["parcel"]["id"] == 1
    assert data["parcel"]["khasra_no"] == "104/1A"


def test_trace_nonexistent_parcel_returns_404():
    """Verify query for invalid parcel ID produces controlled 404 error."""
    res = client.get("/api/v1/canonical/trace/NON-EXISTENT-KHASRA-999")
    assert res.status_code == 404
    assert "No parcel found" in res.json()["detail"]


def test_administrative_hierarchy_tree():
    """Verify canonical hierarchy tree returns multi-tier districts and tehsils."""
    res = client.get("/api/v1/canonical/hierarchy?state_code=DL")
    assert res.status_code == 200
    data = res.json()
    assert data["state"] == "DL"
    assert data["districts_count"] >= 11
    assert len(data["districts"]) >= 11


def test_provenance_audit_metrics():
    """Verify provenance audit returns counts and data quality percentages."""
    res = client.get("/api/v1/canonical/provenance")
    assert res.status_code == 200
    data = res.json()
    assert data["total_parcels"] >= 6
    assert data["total_disputes"] >= 4
    metrics = data["data_quality_metrics"]
    assert metrics["ulpin_coverage_pct"] > 0.0
    assert metrics["geojson_coverage_pct"] > 0.0
    assert metrics["resolved_identifiers_pct"] > 0.0
