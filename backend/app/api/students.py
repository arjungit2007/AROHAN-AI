from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from app import models, schemas
from app.security import get_current_user

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/profile", response_model=schemas.StudentProfileOut)
def get_student_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves the questionnaire profile for the authenticated student."""
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    if not profile:
        # Create blank profile if missing
        profile = models.StudentProfile(
            user_id=current_user.id,
            current_class_or_year="Class 10",
            stream_or_major="General",
            favorite_subjects=[],
            interests=[],
            hobbies_and_activities=[],
            skills=[],
            career_aspirations=[],
            family_income_range=None,
            location_type="rural",
            willingness_to_relocate="nearby_only",
            preferred_learning_mode="mixed"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/profile", response_model=schemas.StudentProfileOut)
def update_student_profile(
    profile_in: schemas.StudentProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates student questionnaire answers (class, subjects, interests, aspirations, constraints)."""
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.StudentProfile(user_id=current_user.id, current_class_or_year="Class 10")
        db.add(profile)

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/dashboard")
def get_student_dashboard(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aggregates active roadmaps, book requests, mentor interactions, and teacher recommendations."""
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    
    # Roadmaps
    roadmaps = db.query(models.SavedRoadmap).filter(
        models.SavedRoadmap.user_id == current_user.id,
        models.SavedRoadmap.is_active == True
    ).all()
    
    # Book Requests
    book_requests = db.query(models.BookRequest).filter(
        models.BookRequest.student_id == current_user.id
    ).order_by(models.BookRequest.created_at.desc()).limit(5).all()

    # Mentorship Requests
    mentor_requests = db.query(models.MentorshipRequest).filter(
        models.MentorshipRequest.student_id == current_user.id
    ).order_by(models.MentorshipRequest.created_at.desc()).limit(5).all()

    # Facilitator Guidance
    assignments = db.query(models.FacilitatorAssignment).filter(
        models.FacilitatorAssignment.student_id == current_user.id,
        models.FacilitatorAssignment.status == "active"
    ).all()
    assignment_ids = [a.id for a in assignments]

    guidance_notes = []
    if assignment_ids:
        notes = db.query(models.GuidanceRecord).filter(
            models.GuidanceRecord.assignment_id.in_(assignment_ids),
            models.GuidanceRecord.is_private_to_facilitator == False
        ).order_by(models.GuidanceRecord.created_at.desc()).limit(5).all()
        for n in notes:
            guidance_notes.append({
                "id": n.id,
                "note": n.note,
                "recommended_pathway_title": n.recommended_pathway_title,
                "created_at": n.created_at
            })

    return {
        "user": {
            "full_name": current_user.full_name,
            "role": current_user.role,
            "district": current_user.district,
            "preferred_language": current_user.preferred_language
        },
        "profile_completed": bool(profile and profile.favorite_subjects and profile.interests),
        "profile": profile,
        "roadmaps_count": len(roadmaps),
        "roadmaps": [
            {
                "id": r.id,
                "pathway_title": r.pathway_title,
                "pathway_category": r.pathway_category,
                "progress_percent": r.progress_percent,
                "steps_count": len(r.steps),
                "completed_steps_count": sum(1 for s in r.steps if s.is_completed)
            }
            for r in roadmaps
        ],
        "book_requests_count": len(book_requests),
        "recent_book_requests": [
            {
                "id": br.id,
                "book_id": br.book_id,
                "book_title": br.book.title if br.book else "Educational Resource",
                "status": br.status,
                "safe_handover_details": br.safe_handover_details,
                "created_at": br.created_at
            }
            for br in book_requests
        ],
        "mentor_requests_count": len(mentor_requests),
        "recent_mentor_requests": [
            {
                "id": mr.id,
                "mentor_name": mr.mentor.display_name if mr.mentor else "Arohan Mentor",
                "topic": mr.topic,
                "status": mr.status,
                "response": mr.mentor_response_message,
                "created_at": mr.created_at
            }
            for mr in mentor_requests
        ],
        "facilitator_guidance": guidance_notes
    }
