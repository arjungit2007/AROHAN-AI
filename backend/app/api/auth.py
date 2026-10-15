from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime

from app.database import get_db
from app import models, schemas
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """Registers a new user account with hashed password and returns access token."""
    if user_in.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration is limited to student accounts. Staff and mentor accounts must be provisioned by an administrator."
        )

    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    # Create User
    new_user = models.User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role if user_in.role in ["student", "teacher", "mentor", "donor"] else "student",
        preferred_language=user_in.preferred_language or "en",
        district=user_in.district,
        state=user_in.state or "Tamil Nadu",
        phone=user_in.phone,
        is_active=True,
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If student, initialize an empty profile skeleton
    if new_user.role == "student":
        student_profile = models.StudentProfile(
            user_id=new_user.id,
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
        db.add(student_profile)
        db.commit()

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=schemas.Token)
def login(login_in: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticates user with email and password."""
    user = db.query(models.User).filter(models.User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated.")

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Fetches details for the currently authenticated user."""
    return current_user

@router.put("/profile", response_model=schemas.UserOut)
def update_user_details(
    update_in: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates user preferences such as preferred language, district, and contact info."""
    if update_in.full_name is not None:
        current_user.full_name = update_in.full_name
    if update_in.preferred_language is not None:
        current_user.preferred_language = update_in.preferred_language
    if update_in.district is not None:
        current_user.district = update_in.district
    if update_in.state is not None:
        current_user.state = update_in.state
    if update_in.phone is not None:
        current_user.phone = update_in.phone

    db.commit()
    db.refresh(current_user)
    return current_user

@router.delete("/account")
def delete_account(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently deletes user account, profile, and associated personal records in compliance with privacy guidelines.
    """
    user_id = current_user.id
    db.delete(current_user)
    
    # Audit log
    audit_entry = models.SyncAuditLog(
        user_id=user_id,
        action="ACCOUNT_DELETED",
        resource_type="USER",
        resource_id=user_id,
        details={"reason": "User requested self deletion"}
    )
    db.add(audit_entry)
    db.commit()

    return {"status": "success", "message": "Account and all associated personal data permanently removed."}
