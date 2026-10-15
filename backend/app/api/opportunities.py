from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app import models, schemas
from app.security import get_optional_current_user
from app.services.eligibility_engine import check_opportunity_eligibility

router = APIRouter(prefix="/opportunities", tags=["Verified Opportunities"])

@router.get("", response_model=List[schemas.OpportunityOut])
def list_opportunities(
    q: Optional[str] = Query(None, description="Search term for title or description"),
    category: Optional[str] = Query(None, description="Category: scholarship, government_scheme, entrance_exam, apprenticeship, internship, free_course"),
    state: Optional[str] = Query(None, description="State filter"),
    verification_status: Optional[str] = Query(None, description="Filter by verified vs sample_demo"),
    db: Session = Depends(get_db)
):
    """
    Search and filter verified opportunities (scholarships, government schemes, entrance exams, apprenticeships).
    Includes source links and verification timestamps.
    """
    query = db.query(models.Opportunity).filter(models.Opportunity.is_active == True)

    if q:
        search_filter = f"%{q}%"
        query = query.filter(
            (models.Opportunity.title.ilike(search_filter)) |
            (models.Opportunity.description.ilike(search_filter)) |
            (models.Opportunity.issuing_organization.ilike(search_filter))
        )

    if category:
        query = query.filter(models.Opportunity.category == category)

    if state and state != "All India":
        query = query.filter(
            (models.Opportunity.state_applicability == "All India") |
            (models.Opportunity.state_applicability == state)
        )

    if verification_status:
        query = query.filter(models.Opportunity.verification_status == verification_status)

    return query.order_by(models.Opportunity.created_at.desc()).all()

@router.get("/{opportunity_id}", response_model=schemas.OpportunityOut)
def get_opportunity_detail(opportunity_id: int, db: Session = Depends(get_db)):
    """Retrieves full details for an opportunity including required documents, eligibility rules, and official links."""
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found.")
    return opp

@router.post("/{opportunity_id}/check-eligibility", response_model=schemas.EligibilityCheckResult)
def evaluate_eligibility(
    opportunity_id: int,
    custom_profile: Optional[schemas.StudentProfileBase] = None,
    current_user: Optional[models.User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Deterministically evaluates a student's eligibility for this opportunity without hallucinating requirements.
    Evaluates education level, income thresholds, and state applicability against confirmed criteria.
    """
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found.")

    student_profile = custom_profile
    user_state = "Tamil Nadu"

    if not student_profile and current_user:
        user_state = current_user.state or "Tamil Nadu"
        db_prof = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
        if db_prof:
            student_profile = schemas.StudentProfileBase(
                current_class_or_year=db_prof.current_class_or_year,
                stream_or_major=db_prof.stream_or_major,
                favorite_subjects=db_prof.favorite_subjects or [],
                interests=db_prof.interests or [],
                skills=db_prof.skills or [],
                family_income_range=db_prof.family_income_range,
                location_type=db_prof.location_type or "rural"
            )

    result = check_opportunity_eligibility(
        opportunity_id=opp.id,
        criteria=opp.eligibility_criteria or {},
        student_profile=student_profile,
        user_state=user_state
    )
    return result
