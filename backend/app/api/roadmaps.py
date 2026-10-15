import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.security import get_current_user

router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])

@router.get("", response_model=List[schemas.SavedRoadmapOut])
def get_student_roadmaps(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all saved roadmaps for the current student."""
    roadmaps = db.query(models.SavedRoadmap).filter(
        models.SavedRoadmap.user_id == current_user.id,
        models.SavedRoadmap.is_active == True
    ).order_by(models.SavedRoadmap.created_at.desc()).all()
    return roadmaps

@router.get("/{roadmap_id}", response_model=schemas.SavedRoadmapOut)
def get_roadmap_detail(
    roadmap_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves a single roadmap with its full milestone steps."""
    roadmap = db.query(models.SavedRoadmap).filter(
        models.SavedRoadmap.id == roadmap_id,
        models.SavedRoadmap.user_id == current_user.id
    ).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found.")
    return roadmap

@router.post("", response_model=schemas.SavedRoadmapOut)
def create_roadmap(
    roadmap_in: schemas.SavedRoadmapCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates and persists a personalized roadmap with ordered milestone steps."""
    new_roadmap = models.SavedRoadmap(
        user_id=current_user.id,
        pathway_title=roadmap_in.pathway_title,
        pathway_category=roadmap_in.pathway_category,
        target_role=roadmap_in.target_role,
        progress_percent=0.0,
        is_active=True
    )
    db.add(new_roadmap)
    db.flush()

    for step_data in roadmap_in.steps:
        step = models.RoadmapStep(
            roadmap_id=new_roadmap.id,
            step_order=step_data.step_order,
            title=step_data.title,
            description=step_data.description,
            is_required=step_data.is_required,
            estimated_duration=step_data.estimated_duration,
            key_skills_or_exams=step_data.key_skills_or_exams,
            official_source_url=step_data.official_source_url,
            official_source_name=step_data.official_source_name,
            is_completed=step_data.is_completed,
            saved_next_action=step_data.saved_next_action
        )
        db.add(step)

    db.commit()
    db.refresh(new_roadmap)
    return new_roadmap

@router.post("/from-pathway", response_model=schemas.SavedRoadmapOut)
def create_roadmap_from_pathway(
    pathway_title: str,
    pathway_category: str = "general",
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Builds a curated, phased learning and qualification roadmap from a selected pathway title."""
    # Build default phased steps based on category & title
    steps_data = []
    
    if "software" in pathway_title.lower() or "developer" in pathway_title.lower():
        steps_data = [
            {
                "step_order": 1,
                "title": "Computer Foundations & Logical Problem Solving",
                "description": "Learn basic command-line usage, file structures, and algorithmic logic.",
                "is_required": True,
                "estimated_duration": "4 weeks",
                "key_skills_or_exams": ["Typing speed", "CS Fundamentals"],
                "official_source_url": "https://www.skillindiadigital.gov.in",
                "official_source_name": "Skill India Digital"
            },
            {
                "step_order": 2,
                "title": "Web Development Fundamentals (HTML, CSS & JavaScript)",
                "description": "Build interactive, mobile-responsive pages and host them online.",
                "is_required": True,
                "estimated_duration": "8 weeks",
                "key_skills_or_exams": ["HTML5/CSS3", "JavaScript", "Git & GitHub"],
                "official_source_url": "https://developer.mozilla.org",
                "official_source_name": "MDN Web Docs"
            },
            {
                "step_order": 3,
                "title": "Enroll in Higher Secondary CS Stream / Diploma / BCA",
                "description": "Formalize qualifications via state government colleges or polytechnics.",
                "is_required": True,
                "estimated_duration": "2-3 years",
                "key_skills_or_exams": ["BCA / B.Sc CS / Polytechnic Diploma"],
                "official_source_url": "https://www.tngasa.in",
                "official_source_name": "TNGASA Admissions Portal"
            },
            {
                "step_order": 4,
                "title": "NPTEL / SWAYAM Certification & Open Source Projects",
                "description": "Complete verified courses in Data Structures & Backend APIs.",
                "is_required": False,
                "estimated_duration": "12 weeks",
                "key_skills_or_exams": ["NPTEL Certificate", "Full Stack Project Portfolio"],
                "official_source_url": "https://swayam.gov.in",
                "official_source_name": "SWAYAM MoE"
            }
        ]
    elif "agriculture" in pathway_title.lower() or "agri" in pathway_title.lower():
        steps_data = [
            {
                "step_order": 1,
                "title": "Agricultural Sciences Foundation (Class 10-12 / KVK)",
                "description": "Understand regional soil types, seasonal crops, and climate resiliency.",
                "is_required": True,
                "estimated_duration": "6 months",
                "key_skills_or_exams": ["Soil testing basics", "Crop cycles"],
                "official_source_url": "https://icar.org.in",
                "official_source_name": "ICAR"
            },
            {
                "step_order": 2,
                "title": "Solar Pump & Micro-Irrigation Installation Training",
                "description": "Hands-on training in drip irrigation systems and solar pump operation.",
                "is_required": True,
                "estimated_duration": "3 months",
                "key_skills_or_exams": ["Drip irrigation", "Solar PV pumps"],
                "official_source_url": "https://pmkusum.mnre.gov.in",
                "official_source_name": "PM KUSUM Scheme"
            },
            {
                "step_order": 3,
                "title": "Diploma in Agriculture or Agri-Business Management",
                "description": "Enroll in state agricultural university or polytechnic.",
                "is_required": False,
                "estimated_duration": "2-3 years",
                "key_skills_or_exams": ["Diploma / Degree in Agriculture"],
                "official_source_url": "https://tnau.ac.in",
                "official_source_name": "TNAU Admissions"
            },
            {
                "step_order": 4,
                "title": "FPO Cooperative Registration & NABARD Support",
                "description": "Form or join a Farmer Producer Company to eliminate intermediaries.",
                "is_required": False,
                "estimated_duration": "Ongoing",
                "key_skills_or_exams": ["NABARD FPO Scheme", "Digital Marketplace"],
                "official_source_url": "https://www.nabard.org",
                "official_source_name": "NABARD"
            }
        ]
    elif "administrative" in pathway_title.lower() or "tnpsc" in pathway_title.lower() or "public" in pathway_title.lower():
        steps_data = [
            {
                "step_order": 1,
                "title": "Complete Class 10 (SSLC) / Higher Secondary",
                "description": "Maintain strong marks and complete Samacheer Kalvi Tamil and Social Science syllabus.",
                "is_required": True,
                "estimated_duration": "1 year",
                "key_skills_or_exams": ["10th / 12th Board Certificate"],
                "official_source_url": "https://www.dge.tn.gov.in",
                "official_source_name": "Directorate of Govt Examinations"
            },
            {
                "step_order": 2,
                "title": "Daily General Studies & Regional Language Preparation",
                "description": "Study Indian Polity, History, Geography, General Science, and Current Affairs daily.",
                "is_required": True,
                "estimated_duration": "9-12 months",
                "key_skills_or_exams": ["General Knowledge", "Aptitude & Mental Ability"],
                "official_source_url": "https://www.tnpsc.gov.in",
                "official_source_name": "TNPSC Official Portal"
            },
            {
                "step_order": 3,
                "title": "Mock Tests & Previous 5-Year Question Solving",
                "description": "Complete timed practice tests to ensure speed and accuracy.",
                "is_required": True,
                "estimated_duration": "3 months",
                "key_skills_or_exams": ["Speed & accuracy", "OMR sheet practice"],
                "official_source_url": "https://www.tnpsc.gov.in",
                "official_source_name": "TNPSC Model Papers"
            },
            {
                "step_order": 4,
                "title": "Apply for TNPSC Group IV / II Online Notification",
                "description": "Complete One-Time Registration (OTR) with Aadhaar and submit application during notification window.",
                "is_required": True,
                "estimated_duration": "Exam cycle",
                "key_skills_or_exams": ["OTR Application", "Hall Ticket"],
                "official_source_url": "https://www.tnpsc.gov.in",
                "official_source_name": "TNPSC Portal"
            }
        ]
    else:
        # General Skill & Degree Pathway
        steps_data = [
            {
                "step_order": 1,
                "title": f"Foundation Phase: Core Knowledge for {pathway_title}",
                "description": "Master fundamental subjects through NCERT textbooks and free open educational resources.",
                "is_required": True,
                "estimated_duration": "3-6 months",
                "key_skills_or_exams": ["Fundamental Theory", "Basic Practical Tools"],
                "official_source_url": "https://diksha.gov.in",
                "official_source_name": "DIKSHA"
            },
            {
                "step_order": 2,
                "title": "Practical Skill Certification (Skill India / NPTEL)",
                "description": "Earn recognized government vocational or technical certification.",
                "is_required": True,
                "estimated_duration": "3-6 months",
                "key_skills_or_exams": ["Vocational Certificate", "Hands-on projects"],
                "official_source_url": "https://www.skillindiadigital.gov.in",
                "official_source_name": "Skill India Digital"
            },
            {
                "step_order": 3,
                "title": "Internship or Apprenticeship (NAPS)",
                "description": "Gain practical industry or fieldwork experience with stipend support.",
                "is_required": True,
                "estimated_duration": "6-12 months",
                "key_skills_or_exams": ["Apprenticeship Certificate", "Workplace Skills"],
                "official_source_url": "https://www.apprenticeshipindia.gov.in",
                "official_source_name": "NAPS Portal"
            }
        ]

    # Save to database
    new_roadmap = models.SavedRoadmap(
        user_id=current_user.id,
        pathway_title=pathway_title,
        pathway_category=pathway_category,
        target_role=pathway_title,
        progress_percent=0.0,
        is_active=True
    )
    db.add(new_roadmap)
    db.flush()

    for s in steps_data:
        step = models.RoadmapStep(
            roadmap_id=new_roadmap.id,
            step_order=s["step_order"],
            title=s["title"],
            description=s["description"],
            is_required=s["is_required"],
            estimated_duration=s.get("estimated_duration"),
            key_skills_or_exams=s.get("key_skills_or_exams", []),
            official_source_url=s.get("official_source_url"),
            official_source_name=s.get("official_source_name"),
            is_completed=False
        )
        db.add(step)

    db.commit()
    db.refresh(new_roadmap)
    return new_roadmap

@router.put("/steps/{step_id}", response_model=schemas.RoadmapStepOut)
def update_step_status(
    step_id: int,
    step_update: schemas.RoadmapStepUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates completion status of a roadmap milestone and recalculates total roadmap progress percentage.
    """
    step = db.query(models.RoadmapStep).filter(models.RoadmapStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Step not found.")
    
    roadmap = db.query(models.SavedRoadmap).filter(
        models.SavedRoadmap.id == step.roadmap_id,
        models.SavedRoadmap.user_id == current_user.id
    ).first()
    if not roadmap:
        raise HTTPException(status_code=403, detail="Not authorized to edit this roadmap step.")

    if step_update.is_completed is not None:
        step.is_completed = step_update.is_completed
        step.completed_at = datetime.datetime.now(datetime.timezone.utc) if step_update.is_completed else None

    if step_update.saved_next_action is not None:
        step.saved_next_action = step_update.saved_next_action

    db.commit()

    # Recalculate roadmap progress percent
    all_steps = db.query(models.RoadmapStep).filter(models.RoadmapStep.roadmap_id == roadmap.id).all()
    if all_steps:
        completed = sum(1 for s in all_steps if s.is_completed)
        roadmap.progress_percent = round((completed / len(all_steps)) * 100, 1)
        db.commit()

    db.refresh(step)
    return step

@router.delete("/{roadmap_id}")
def delete_roadmap(
    roadmap_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes or archives a roadmap."""
    roadmap = db.query(models.SavedRoadmap).filter(
        models.SavedRoadmap.id == roadmap_id,
        models.SavedRoadmap.user_id == current_user.id
    ).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found.")
    
    db.delete(roadmap)
    db.commit()
    return {"status": "success", "message": "Roadmap deleted successfully."}
