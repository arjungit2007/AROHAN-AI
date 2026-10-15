from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app import models, schemas
from app.security import get_optional_current_user
from app.services.ai_provider import get_ai_provider

router = APIRouter(prefix="/ai", tags=["AI Career Discovery"])

@router.get("/recommend", response_model=schemas.CareerRecommendationResponse)
@router.post("/recommend", response_model=schemas.CareerRecommendationResponse)
async def recommend_career_pathways(
    profile_payload: Optional[schemas.StudentProfileBase] = None,
    current_user: Optional[models.User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Synthesizes student's education level, favorite subjects, skills, and aspirations to generate
    3-4 realistic pathways across academic, vocational, public-service, technical, or agricultural routes.
    Uses configured AI provider (Gemini / OpenAI) or transparent deterministic rule-based matching engine.
    """
    target_profile = profile_payload

    if not target_profile and current_user:
        db_profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
        if db_profile:
            target_profile = schemas.StudentProfileBase(
                current_class_or_year=db_profile.current_class_or_year,
                stream_or_major=db_profile.stream_or_major,
                favorite_subjects=db_profile.favorite_subjects or [],
                interests=db_profile.interests or [],
                hobbies_and_activities=db_profile.hobbies_and_activities or [],
                skills=db_profile.skills or [],
                career_aspirations=db_profile.career_aspirations or [],
                family_income_range=db_profile.family_income_range,
                location_type=db_profile.location_type or "rural",
                willingness_to_relocate=db_profile.willingness_to_relocate or "nearby_only",
                preferred_learning_mode=db_profile.preferred_learning_mode or "mixed",
                accessibility_needs=db_profile.accessibility_needs
            )

    if not target_profile:
        # Default fallback skeleton if unauthenticated visitor explores
        target_profile = schemas.StudentProfileBase(
            current_class_or_year="Class 10",
            stream_or_major="General",
            favorite_subjects=["Mathematics", "Science"],
            interests=["Technology", "Practical Work"],
            skills=["Problem Solving", "Curiosity"],
            career_aspirations=["Technical Career"]
        )

    provider = get_ai_provider()
    recommendations = await provider.generate_career_recommendations(target_profile)
    return recommendations

@router.post("/chat", response_model=schemas.AIChatResponse)
async def conversational_career_chat(
    chat_req: schemas.AIChatRequest,
    current_user: Optional[models.User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Interactive conversational career exploration assistant.
    Provides context-grounded guidance, identifies relevant pathways, and suggests actionable next steps.
    """
    context = chat_req.student_context
    if not context and current_user:
        db_profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
        if db_profile:
            context = schemas.StudentProfileBase(
                current_class_or_year=db_profile.current_class_or_year,
                stream_or_major=db_profile.stream_or_major,
                favorite_subjects=db_profile.favorite_subjects or [],
                interests=db_profile.interests or [],
                hobbies_and_activities=db_profile.hobbies_and_activities or [],
                skills=db_profile.skills or [],
                career_aspirations=db_profile.career_aspirations or [],
                family_income_range=db_profile.family_income_range
            )

    provider = get_ai_provider()
    messages_payload = [{"role": m.role, "content": m.content} for m in chat_req.messages]
    response = await provider.chat(messages_payload, context)
    return response
