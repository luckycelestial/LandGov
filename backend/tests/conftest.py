import pytest
from sqlmodel import SQLModel, create_engine, Session
from app.main import app
from app.infrastructure.db.sqlite_client import get_session, seed_database, _migrate_sqlite_columns


@pytest.fixture(autouse=True)
def setup_test_db(tmp_path):
    """
    Creates an isolated temporary SQLite database for each test,
    ensuring idempotent test executions without duplicate key collisions.
    """
    test_db_file = tmp_path / "test_landgov.db"
    test_db_url = f"sqlite:///{test_db_file}"
    test_engine = create_engine(test_db_url, connect_args={"check_same_thread": False})

    SQLModel.metadata.create_all(test_engine)

    def test_get_session():
        with Session(test_engine) as session:
            yield session

    # Populate baseline seed data into test engine
    from app.infrastructure.db import sqlite_client
    original_engine = sqlite_client.engine
    sqlite_client.engine = test_engine

    with Session(test_engine) as session:
        sqlite_client.seed_delhi_administrative_units(session)

    # Seed baseline parcels & disputes
    seed_database()

    app.dependency_overrides[get_session] = test_get_session
    yield

    app.dependency_overrides.clear()
    sqlite_client.engine = original_engine
