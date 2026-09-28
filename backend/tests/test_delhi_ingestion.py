import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_ingest_valid_geojson_parcel():
    """Verify ingestion of GeoJSON Feature with closed polygon and properties."""
    payload = {
        "source_system": "DELHI_GEOPORTAL_TEST",
        "provenance_type": "REAL",
        "geojson": {
            "type": "Feature",
            "properties": {
                "khasra_no": "TEST/999/1",
                "village": "Najafgarh",
                "district": "South West Delhi",
                "area_acres": 3.75,
                "land_use": "Agricultural",
                "owner_name": "Satish Kumar Sharma",
                "title_status": "Clear",
                "lat": 28.6105,
                "lng": 76.9920
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [76.990, 28.610],
                        [76.995, 28.610],
                        [76.994, 28.613],
                        [76.989, 28.612],
                        [76.990, 28.610]
                    ]
                ]
            }
        }
    }

    res = client.post("/api/v1/ingestion/geojson", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["records_ingested"] == 1
    assert data["records_failed"] == 0

    # Verify parcel is now queryable
    trace_res = client.get("/api/v1/canonical/trace/TEST/999/1")
    assert trace_res.status_code == 200
    trace_data = trace_res.json()
    assert trace_data["parcel"]["khasra_no"] == "TEST/999/1"
    assert trace_data["provenance"]["source_system"] == "DELHI_GEOPORTAL_TEST"
    assert trace_data["provenance"]["provenance_type"] == "REAL"
    assert trace_data["parcel"]["ulpin"] is not None


def test_ingest_csv_parcels():
    """Verify tabular CSV ingestion of cadastral land records."""
    csv_text = (
        "khasra_no,village,taluka,district,area_acres,land_use,owner_name,title_status,lat,lng\n"
        "CSV/88/A,Alipur,North Delhi,North Delhi,5.20,Commercial,Northfield Logistics,Clear,28.8010,77.1320\n"
        "CSV/88/B,Alipur,North Delhi,North Delhi,3.10,Agricultural,Harish Verma,Clear,28.8020,77.1340\n"
    )

    payload = {
        "csv_content": csv_text,
        "source_system": "DORIS_BATCH_CSV",
        "provenance_type": "CURATED"
    }

    res = client.post("/api/v1/ingestion/csv-parcels", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["records_ingested"] == 2
    assert data["records_failed"] == 0

    # Verify parcel in database
    p_res = client.get("/api/v1/canonical/trace/CSV/88/A")
    assert p_res.status_code == 200
    assert p_res.json()["parcel"]["area_acres"] == 5.20


def test_ingest_disputes_with_auto_parcel_linkage():
    """Verify structured dispute ingestion automatically links parcel_id to corresponding Khasra."""
    disputes_payload = [
        {
            "case_number": "TEST/DISP/2026/01",
            "khasra_no": "104/1A",  # Existing seeded parcel
            "district": "South Delhi",
            "court_type": "Revenue Court (SDM)",
            "title": "Prasad Boundary Partition Contest",
            "description": "Partition dispute between co-owners regarding share distribution.",
            "dispute_category": "Succession/Inheritance",
            "status": "Active",
            "filing_date": "2026-03-01",
            "estimated_value_lakhs": 65.0,
            "plaintiff": "Mohan Prasad",
            "defendant": "Rameshwar Prasad",
            "risk_level": "Medium"
        }
    ]

    res = client.post("/api/v1/ingestion/disputes-json", json=disputes_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["records_ingested"] == 1
    assert data["linked_to_parcels_count"] == 1

    # Verify trace of 104/1A now includes this new dispute
    trace_res = client.get("/api/v1/canonical/trace/104/1A")
    assert trace_res.status_code == 200
    trace_cases = [d["case_number"] for d in trace_res.json()["dispute_cases"]]
    assert "TEST/DISP/2026/01" in trace_cases


def test_ingest_order_document():
    """Verify parsing semi-structured court order text into a DisputeCase."""
    order_text = (
        "IN THE COURT OF SUB-DIVISIONAL MAGISTRATE, NAJAFGARH, NEW DELHI\n"
        "Case No: REV/SDM/2026/7788\n"
        "Gram Panchayat Najafgarh versus Om Prakash & Others\n"
        "Subject: Demarcation review and boundary encroachment on Khasra 218/3B\n"
        "It is ordered that a stay order be maintained until drone resurvey."
    )

    payload = {
        "order_text": order_text,
        "filename": "SDM_Order_7788.pdf",
        "district": "South West Delhi",
        "court_type": "Revenue Court (SDM)"
    }

    res = client.post("/api/v1/ingestion/order-document", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["case_number"] == "REV/SDM/2026/7788"
    assert data["khasra_no"] == "218/3B"
    assert data["linked_parcel_id"] == 2
    assert data["risk_level"] in ["High", "Critical"]
