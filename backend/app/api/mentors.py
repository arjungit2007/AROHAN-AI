from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app import models, schemas
from app.security import get_current_user

router = APIRouter(prefix="/mentors", tags=["Arohan Connect Mentorship"])

@router.get("", response_model=List[schemas.MentorProfileOut])
def list_mentors(
    expertise: Optional[str] = Query(None, description="Filter by expertise area"),
    language: Optional[str] = Query(None, description="Filter by language"),
    verified_only: bool = Query(False, description="Filter verified mentors"),
    db: Session = Depends(get_db)
):
    """
    Lists mentor profiles. Private contact information is strictly protected.
    Clearly marks verification status.
    """
    query = db.query(models.MentorProfile)
    if verified_only:
        query = query.filter(models.MentorProfile.is_verified == True)

    mentors = query.all()
    filtered = []
    for m in mentors:
        if expertise and expertise.lower() not in [e.lower() for e in (m.expertise_areas or [])]:
            continue
        if language and language.lower() not in [l.lower() for l in (m.languages_spoken or [])]:
            continue
        filtered.append(m)

    return filtered

@router.get("/my/requests", response_model=List[schemas.MentorshipRequestOut])
def get_my_mentorship_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves mentorship requests associated with current user (as either student or mentor).
    """
    results = []
    if current_user.role == "mentor":
        mentor_prof = db.query(models.MentorProfile).filter(models.MentorProfile.user_id == current_user.id).first()
        if mentor_prof:
            reqs = db.query(models.MentorshipRequest).filter(
                models.MentorshipRequest.mentor_id == mentor_prof.id
            ).order_by(models.MentorshipRequest.created_at.desc()).all()
            for r in reqs:
                results.append(
                    schemas.MentorshipRequestOut(
                        id=r.id,
                        mentor_id=r.mentor_id,
                        mentor_name=mentor_prof.display_name,
                        student_id=r.student_id,
                        student_name=r.student.full_name if r.student else "Student",
                        topic=r.topic,
                        student_goals=r.student_goals,
                        preferred_language=r.preferred_language,
                        status=r.status,
                        mentor_response_message=r.mentor_response_message,
                        safety_notes=r.safety_notes,
                        created_at=r.created_at,
                        updated_at=r.updated_at
                    )
                )
    else:
        reqs = db.query(models.MentorshipRequest).filter(
            models.MentorshipRequest.student_id == current_user.id
        ).order_by(models.MentorshipRequest.created_at.desc()).all()
        for r in reqs:
            results.append(
                schemas.MentorshipRequestOut(
                    id=r.id,
                    mentor_id=r.mentor_id,
                    mentor_name=r.mentor.display_name if r.mentor else "Arohan Mentor",
                    student_id=r.student_id,
                    student_name=current_user.full_name,
                    topic=r.topic,
                    student_goals=r.student_goals,
                    preferred_language=r.preferred_language,
                    status=r.status,
                    mentor_response_message=r.mentor_response_message,
                    safety_notes=r.safety_notes,
                    created_at=r.created_at,
                    updated_at=r.updated_at
                )
            )

    return results

@router.get("/{mentor_id}", response_model=schemas.MentorProfileOut)
def get_mentor_detail(mentor_id: int, db: Session = Depends(get_db)):
    """Retrieves mentor profile with public guidance topics."""
    mentor = db.query(models.MentorProfile).filter(models.MentorProfile.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor profile not found.")
    return mentor

@router.post("/{mentor_id}/request", response_model=schemas.MentorshipRequestOut)
def request_mentorship(
    mentor_id: int,
    req_in: schemas.MentorshipRequestCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a platform-mediated mentorship guidance request.
    Enforces child/youth safety guidelines and prevents duplicate pending requests.
    """
    mentor = db.query(models.MentorProfile).filter(models.MentorProfile.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found.")

    if mentor.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot request mentorship from yourself.")

    # Check for existing pending request
    existing = db.query(models.MentorshipRequest).filter(
        models.MentorshipRequest.mentor_id == mentor_id,
        models.MentorshipRequest.student_id == current_user.id,
        models.MentorshipRequest.status == "pending"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending mentorship request with this mentor.")

    mentorship_req = models.MentorshipRequest(
        mentor_id=mentor.id,
        student_id=current_user.id,
        topic=req_in.topic,
        student_goals=req_in.student_goals,
        preferred_language=req_in.preferred_language or "English",
        status="pending",
        safety_notes="All sessions are platform-mediated and adhere to youth protection protocols. No unmonitored private contact allowed."
    )
    db.add(mentorship_req)
    db.commit()
    db.refresh(mentorship_req)

    return schemas.MentorshipRequestOut(
        id=mentorship_req.id,
        mentor_id=mentorship_req.mentor_id,
        mentor_name=mentor.display_name,
        student_id=mentorship_req.student_id,
        student_name=current_user.full_name,
        topic=mentorship_req.topic,
        student_goals=mentorship_req.student_goals,
        preferred_language=mentorship_req.preferred_language,
        status=mentorship_req.status,
        safety_notes=mentorship_req.safety_notes,
        created_at=mentorship_req.created_at,
        updated_at=mentorship_req.updated_at
    )

@router.put("/requests/{request_id}", response_model=schemas.MentorshipRequestOut)
def update_mentorship_request(
    request_id: int,
    status_update: schemas.MentorshipRequestStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mentor accepts or declines a mentorship request and provides guidance feedback.
    """
    req = db.query(models.MentorshipRequest).filter(models.MentorshipRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    mentor_prof = db.query(models.MentorProfile).filter(models.MentorProfile.id == req.mentor_id).first()
    if not mentor_prof or mentor_prof.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the assigned mentor can respond to this request.")

    if status_update.status not in ["accepted", "declined", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status update.")

    req.status = status_update.status
    if status_update.mentor_response_message:
        req.mentor_response_message = status_update.mentor_response_message

    db.commit()
    db.refresh(req)

    return schemas.MentorshipRequestOut(
        id=req.id,
        mentor_id=req.mentor_id,
        mentor_name=mentor_prof.display_name,
        student_id=req.student_id,
        student_name=req.student.full_name if req.student else "Student",
        topic=req.topic,
        student_goals=req.student_goals,
        preferred_language=req.preferred_language,
        status=req.status,
        mentor_response_message=req.mentor_response_message,
        safety_notes=req.safety_notes,
        created_at=req.created_at,
        updated_at=req.updated_at
    )
