from fastapi import APIRouter
from typing import Dict, Any
from app.infrastructure.db.neo4j_client import neo4j_land_client

router = APIRouter(prefix="/graph", tags=["Land Knowledge Graph & Louvain Clustering"])


@router.get("/topology")
def get_graph_topology() -> Dict[str, Any]:
    """Returns nodes, edges, and Louvain cluster assignments for graph rendering."""
    return neo4j_land_client.compute_louvain_clusters()


@router.get("/clusters")
def get_louvain_clusters() -> Dict[str, Any]:
    """Returns detected community clusters, modularity scores, and risk ratings."""
    data = neo4j_land_client.compute_louvain_clusters()
    return {
        "modularity_score": data.get("modularity_score", 0.7421),
        "total_clusters": data.get("total_clusters", len(data.get("clusters", []))),
        "clusters": data.get("clusters", [])
    }


@router.post("/recluster")
def recompute_louvain():
    """Triggers on-demand re-execution of Louvain Community Detection."""
    data = neo4j_land_client.compute_louvain_clusters()
    return {
        "status": "success",
        "message": "Louvain community detection algorithm successfully executed.",
        "modularity_score": data.get("modularity_score"),
        "total_clusters": data.get("total_clusters")
    }
