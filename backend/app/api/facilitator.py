from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.security import get_current_user, require_roles

router = APIRouter(prefix="/facilitator", tags=["Teacher & Facilitator"])

@router.get("/students", response_model=List[schemas.FacilitatorStudentSummary])
def get_assigned_students(
    current_user: models.User = Depends(require_roles(["teacher", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Retrieves authorized students assigned to this teacher/facilitator.
    Restricts access strictly to verified faculty and authorized personnel.
    """
    assignments = db.query(models.FacilitatorAssignment).filter(
        models.FacilitatorAssignment.teacher_id == current_user.id,
        models.FacilitatorAssignment.status == "active"
    ).all()

    summaries = []
    for a in assignments:
        student = db.query(models.User).filter(models.User.id == a.student_id).first()
        if not student:
            continue
        
        profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == student.id).first()
        
        roadmaps = db.query(models.SavedRoadmap).filter(
            models.SavedRoadmap.user_id == student.id,
            models.SavedRoadmap.is_active == True
        ).all()
        
        latest_progress = roadmaps[0].progress_percent if roadmaps else 0.0

        notes_count = db.query(models.GuidanceRecord).filter(
            models.GuidanceRecord.assignment_id == a.id
        ).count()

        summaries.append(
            schemas.FacilitatorStudentSummary(
                assignment_id=a.id,
                student_id=student.id,
                student_name=student.full_name,
                student_email=student.email,
                school_or_center_name=a.school_or_center_name,
                current_class_or_year=profile.current_class_or_year if profile else "Unknown",
                favorite_subjects=profile.favorite_subjects if profile else [],
                interests=profile.interests if profile else [],
                active_roadmaps_count=len(roadmaps),
                latest_roadmap_progress=latest_progress,
                guidance_notes_count=notes_count,
                assigned_at=a.assigned_at
            )
        )
    return summaries

@router.get("/students/{student_id}")
def get_assigned_student_detail(
    student_id: int,
    current_user: models.User = Depends(require_roles(["teacher", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Detailed review of an authorized student's learning progress and active roadmaps.
    Verifies that teacher is authorized for this specific student.
    """
    assignment = db.query(models.FacilitatorAssignment).filter(
        models.FacilitatorAssignment.teacher_id == current_user.id,
        models.FacilitatorAssignment.student_id == student_id,
        models.FacilitatorAssignment.status == "active"
    ).first()
    if not assignment and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You are not authorized to view this student's records.")

    student = db.query(models.User).filter(models.User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == student_id).first()
    roadmaps = db.query(models.SavedRoadmap).filter(models.SavedRoadmap.user_id == student_id).all()
    
    guidance_notes = []
    if assignment:
        notes = db.query(models.GuidanceRecord).filter(
            models.GuidanceRecord.assignment_id == assignment.id
        ).order_by(models.GuidanceRecord.created_at.desc()).all()
        for n in notes:
            guidance_notes.append({
                "id": n.id,
                "note": n.note,
                "recommended_pathway_title": n.recommended_pathway_title,
                "recommended_opportunity_id": n.recommended_opportunity_id,
                "is_private_to_facilitator": n.is_private_to_facilitator,
                "created_at": n.created_at
            })

    return {
        "student_id": student.id,
        "full_name": student.full_name,
        "email": student.email,
        "district": student.district,
        "preferred_language": student.preferred_language,
        "profile": profile,
        "roadmaps": [
            {
                "id": r.id,
                "pathway_title": r.pathway_title,
                "progress_percent": r.progress_percent,
                "steps": [
                    {
                        "id": s.id,
                        "step_order": s.step_order,
                        "title": s.title,
                        "is_completed": s.is_completed,
                        "saved_next_action": s.saved_next_action
                    }
                    for s in r.steps
                ]
            }
            for r in roadmaps
        ],
        "guidance_notes": guidance_notes
    }

@router.post("/guidance", response_model=schemas.GuidanceRecordOut)
def add_guidance_record(
    guidance_in: schemas.GuidanceRecordCreate,
    current_user: models.User = Depends(require_roles(["teacher", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Adds teacher guidance notes and recommended pathways/scholarships to a student.
    """
    assignment = db.query(models.FacilitatorAssignment).filter(
        models.FacilitatorAssignment.id == guidance_in.assignment_id,
        models.FacilitatorAssignment.teacher_id == current_user.id
    ).first()
    if not assignment and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to advise this student.")

    record = models.GuidanceRecord(
        assignment_id=guidance_in.assignment_id,
        note=guidance_in.note,
        recommended_pathway_title=guidance_in.recommended_pathway_title,
        recommended_opportunity_id=guidance_in.recommended_opportunity_id,
        is_private_to_facilitator=guidance_in.is_private_to_facilitator
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.post("/assign-student")
def assign_student_to_facilitator(
    student_email: str,
    school_name: str,
    current_user: models.User = Depends(require_roles(["teacher", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Allows a teacher/facilitator to onboard or link a student to their cohort using student's email.
    """
    student = db.query(models.User).filter(models.User.email == student_email, models.User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student with this email not found.")

    existing = db.query(models.FacilitatorAssignment).filter(
        models.FacilitatorAssignment.teacher_id == current_user.id,
        models.FacilitatorAssignment.student_id == student.id
    ).first()
    if existing:
        return {"status": "already_assigned", "assignment_id": existing.id}

    new_assignment = models.FacilitatorAssignment(
        teacher_id=current_user.id,
        student_id=student.id,
        school_or_center_name=school_name,
        status="active"
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return {"status": "assigned_successfully", "assignment_id": new_assignment.id}
