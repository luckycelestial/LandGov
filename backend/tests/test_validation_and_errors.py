import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_reject_unclosed_geojson_polygon():
    """Verify malformed GeoJSON with unclosed polygon is rejected with controlled error."""
    payload = {
        "source_system": "TEST_ERRORS",
        "geojson": {
            "type": "Feature",
            "properties": {
                "khasra_no": "ERR/001",
                "district": "South Delhi",
                "lat": 28.52,
                "lng": 77.18
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    # Unclosed ring (start != end)
                    [[77.18, 28.52], [77.19, 28.52], [77.19, 28.53], [77.18, 28.54]]
                ]
            }
        }
    }

    res = client.post("/api/v1/ingestion/geojson", json=payload)
    assert res.status_code == 400
    detail = res.json()["detail"]
    assert detail["records_failed"] == 1
    assert "not closed" in detail["errors"][0]["reason"]


def test_reject_out_of_bounds_coordinates():
    """Verify parcel with coordinates outside NCT of Delhi is rejected."""
    payload = {
        "source_system": "TEST_ERRORS",
        "geojson": {
            "type": "Feature",
            "properties": {
                "khasra_no": "ERR/OOB/100",
                "district": "South Delhi",
                "lat": 13.0827,  # Chennai latitude, outside Delhi
                "lng": 80.2707
            }
        }
    }

    res = client.post("/api/v1/ingestion/geojson", json=payload)
    assert res.status_code == 400
    detail = res.json()["detail"]
    assert detail["records_failed"] == 1
    assert "outside NCT of Delhi" in detail["errors"][0]["reason"]


def test_duplicate_parcel_detection():
    """Verify ingesting the same Khasra in the same district twice detects duplicate and rejects."""
    payload = {
        "source_system": "TEST_DUP",
        "geojson": {
            "type": "Feature",
            "properties": {
                "khasra_no": "DUP/777",
                "district": "South Delhi",
                "lat": 28.524,
                "lng": 77.185
            }
        }
    }

    # First attempt: succeeds
    res1 = client.post("/api/v1/ingestion/geojson", json=payload)
    assert res1.status_code == 200

    # Second attempt: rejected as duplicate
    res2 = client.post("/api/v1/ingestion/geojson", json=payload)
    assert res2.status_code == 400
    detail = res2.json()["detail"]
    assert detail["records_failed"] == 1
    assert "Duplicate parcel detected" in detail["errors"][0]["reason"]


def test_missing_khasra_handles_unresolved_gracefully():
    """Verify missing Khasra retains source ID and marks is_resolved=False without fabricating."""
    from app.domain.services.ingestion.delhi_connector import DelhiConnector
    connector = DelhiConnector()

    raw_data = {
        "properties": {
            "id": "SRC-REC-994",
            "district": "East Delhi",
            "lat": 28.67,
            "lng": 77.29
        }
    }

    norm = connector.normalize_record(raw_data)
    assert norm["is_resolved"] is False
    assert "UNRESOLVED-SRC-REC-994" in norm["khasra_no"]
    assert norm["ulpin"] is None


def test_canonical_dry_run_validate_endpoint():
    """Verify POST /api/v1/canonical/validate returns validation diagnosis without saving."""
    payload = {
        "khasra_no": "VAL/123",
        "district": "North Delhi",
        "lat": 28.80,
        "lng": 77.13,
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [[77.13, 28.80], [77.14, 28.80], [77.14, 28.81], [77.13, 28.81], [77.13, 28.80]]
            ]
        }
    }

    res = client.post("/api/v1/canonical/validate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["geometry_valid"] is True
    assert data["coordinates_in_bounds"] is True
    assert data["normalized_record"]["khasra_no"] == "VAL/123"
