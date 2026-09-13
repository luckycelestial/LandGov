from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List

router = APIRouter(prefix="/simulation", tags=["Policy Simulation & What-If Sandbox"])


class SimulationRequest(BaseModel):
    drone_survey_coverage_pct: float = 80.0  # 0 to 100
    fast_track_courts_adoption_pct: float = 60.0  # 0 to 100
    auto_mutation_enactment: bool = True
    ai_boundary_validation: bool = True
    projection_years: int = 5


@router.post("/run")
def run_policy_simulation(req: SimulationRequest) -> Dict[str, Any]:
    """Simulates economic and legal outcomes based on policy lever adjustments."""
    
    # Mathematical outcome simulation
    base_dispute_rate = 18.2  # %
    digitization_factor = (req.drone_survey_coverage_pct / 100.0) * 0.45
    court_factor = (req.fast_track_courts_adoption_pct / 100.0) * 0.35
    automation_bonus = 0.15 if req.auto_mutation_enactment else 0.0
    ai_bonus = 0.20 if req.ai_boundary_validation else 0.0

    total_reduction_factor = min(0.85, (digitization_factor + court_factor + automation_bonus + ai_bonus))
    projected_dispute_rate = round(base_dispute_rate * (1.0 - total_reduction_factor), 1)
    
    # Financial metrics
    capital_unlocked_crores = round((req.drone_survey_coverage_pct * 142.5) + (180.0 if req.auto_mutation_enactment else 40.0), 1)
    avg_disposal_months = max(2.5, round(18.0 - (total_reduction_factor * 14.0), 1))
    farmer_credit_growth_pct = round(12.0 + (req.drone_survey_coverage_pct * 0.22), 1)

    # 5-year yearly projection trajectory
    yearly_trajectory = []
    current_rate = base_dispute_rate
    yearly_step = (base_dispute_rate - projected_dispute_rate) / req.projection_years

    for year in range(1, req.projection_years + 1):
        current_rate = round(current_rate - yearly_step, 1)
        yearly_trajectory.append({
            "year": f"Year {year} (202{5+year})",
            "dispute_rate_pct": current_rate,
            "credit_unlocked_cr": round(capital_unlocked_crores * (year / req.projection_years), 1),
            "cases_disposed_thousands": round(14.0 + (year * 8.5 * (req.fast_track_courts_adoption_pct / 50.0)), 1)
        })

    return {
        "inputs": req.model_dump(),
        "summary_outcomes": {
            "dispute_reduction_pct": round(total_reduction_factor * 100, 1),
            "projected_dispute_rate_pct": projected_dispute_rate,
            "capital_unlocked_crores": capital_unlocked_crores,
            "avg_case_disposal_months": avg_disposal_months,
            "farmer_credit_growth_pct": farmer_credit_growth_pct,
            "tenure_security_index_score": round(65.0 + (total_reduction_factor * 32.0), 1)
        },
        "yearly_trajectory": yearly_trajectory,
        "policy_recommendations": [
            f"Prioritize Drone Cadastral Surveys in high-density rural blocks to capture an estimated ₹{capital_unlocked_crores} Cr in formal collateral.",
            "Establish electronic pre-litigation mediation tribunals to bring average disposal time down to under " + str(avg_disposal_months) + " months.",
            "Activate API integration between Revenue and Sub-Registrar offices to prevent unauthorized multi-party encumbrances."
        ]
    }
