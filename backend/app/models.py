import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False) # student, teacher, mentor, donor, admin
    preferred_language = Column(String(10), default="en") # en, ta, hi, etc.
    phone = Column(String(50), nullable=True) # kept private
    district = Column(String(100), nullable=True)
    state = Column(String(100), default="Tamil Nadu")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    roadmaps = relationship("SavedRoadmap", back_populates="user", cascade="all, delete-orphan")
    book_listings = relationship("BookListing", back_populates="donor", cascade="all, delete-orphan")
    book_requests = relationship("BookRequest", back_populates="student", cascade="all, delete-orphan")
    mentor_profile = relationship("MentorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    mentorship_requests = relationship("MentorshipRequest", foreign_keys="MentorshipRequest.student_id", back_populates="student", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    current_class_or_year = Column(String(100), nullable=False) # Class 9, Class 10, Class 11, Class 12, UG Year 1, UG Year 2, UG Year 3, Graduate
    stream_or_major = Column(String(100), nullable=True) # Science, Commerce, Arts, Vocational, Engineering, etc.
    favorite_subjects = Column(JSON, default=list) # e.g. ["Mathematics", "Computer Science", "Physics"]
    interests = Column(JSON, default=list) # e.g. ["Technology", "Farming & Agriculture", "Public Service"]
    hobbies_and_activities = Column(JSON, default=list) # e.g. ["Fixing electronics", "Drawing", "Sports"]
    skills = Column(JSON, default=list) # e.g. ["Problem solving", "Speaking", "Coding"]
    career_aspirations = Column(JSON, default=list) # e.g. ["Software Engineer", "Government Officer", "Entrepreneur"]
    family_income_range = Column(String(50), nullable=True) # e.g. "< 1.5 Lakhs", "1.5 - 3 Lakhs", "3 - 6 Lakhs", "> 6 Lakhs"
    location_type = Column(String(50), default="rural") # rural, semi-urban, urban
    willingness_to_relocate = Column(String(50), default="nearby_only") # yes, nearby_only, no
    preferred_learning_mode = Column(String(50), default="mixed") # practical, academic, vocational, mixed
    accessibility_needs = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")

class CareerPathway(Base):
    __tablename__ = "career_pathways"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    category = Column(String(50), nullable=False) # academic, vocational, public_service, creative, entrepreneurship, technical
    summary = Column(Text, nullable=False)
    why_it_matches = Column(Text, nullable=False)
    educational_prerequisites = Column(Text, nullable=False)
    typical_duration = Column(String(100), nullable=False)
    estimated_cost_range = Column(String(100), default="Low / Subsidized")
    known_uncertainties = Column(Text, nullable=True)
    suggested_first_step = Column(Text, nullable=False)
    alternative_pathways = Column(JSON, default=list) # list of alternative titles/descriptions
    source_references = Column(JSON, default=list) # list of source URLs and official schemes
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SavedRoadmap(Base):
    __tablename__ = "saved_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    pathway_title = Column(String(255), nullable=False)
    pathway_category = Column(String(50), default="general")
    target_role = Column(String(255), nullable=True)
    progress_percent = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="roadmaps")
    steps = relationship("RoadmapStep", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapStep.step_order")

class RoadmapStep(Base):
    __tablename__ = "roadmap_steps"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("saved_roadmaps.id", ondelete="CASCADE"), nullable=False)
    step_order = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    is_required = Column(Boolean, default=True) # Required vs Recommended
    estimated_duration = Column(String(100), nullable=True) # e.g. "3-6 months"
    key_skills_or_exams = Column(JSON, default=list) # e.g. ["Python basics", "NPTEL certificate"]
    official_source_url = Column(String(500), nullable=True)
    official_source_name = Column(String(255), nullable=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    saved_next_action = Column(String(255), nullable=True)

    roadmap = relationship("SavedRoadmap", back_populates="steps")

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    category = Column(String(50), index=True, nullable=False) # scholarship, government_scheme, entrance_exam, apprenticeship, internship, free_course
    issuing_organization = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    official_source_url = Column(String(500), nullable=False)
    application_url = Column(String(500), nullable=True)
    eligibility_criteria = Column(JSON, default=dict) # min_education, max_family_income, gender, target_states, min_marks_pct, etc.
    required_documents = Column(JSON, default=list) # list of required documents
    start_date = Column(String(50), nullable=True)
    closing_date = Column(String(50), nullable=True)
    last_verified_at = Column(DateTime, default=datetime.datetime.utcnow)
    verification_status = Column(String(50), default="verified") # verified, awaiting_verification, sample_demo
    state_applicability = Column(String(100), default="All India")
    education_stage_applicability = Column(JSON, default=list) # ["Class 9-10", "Class 11-12", "Undergraduate", "Graduate"]
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class BookListing(Base):
    __tablename__ = "book_listings"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), index=True, nullable=False)
    author = Column(String(255), nullable=True)
    subject = Column(String(100), index=True, nullable=False)
    class_or_exam = Column(String(100), nullable=False) # Class 10, Class 12, NEET, JEE, TNPSC, Banking, Engineering
    language = Column(String(50), default="English") # English, Tamil, Hindi
    edition = Column(String(50), nullable=True)
    condition = Column(String(50), default="good") # like_new, good, fair
    general_pickup_area = Column(String(255), nullable=False) # General area only, no private addresses
    collection_point_name = Column(String(255), default="Local Panchayat Library / School Hub")
    status = Column(String(50), default="available") # available, requested, reserved, donated
    image_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    donor = relationship("User", back_populates="book_listings")
    requests = relationship("BookRequest", back_populates="book", cascade="all, delete-orphan")

class BookRequest(Base):
    __tablename__ = "book_requests"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("book_listings.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    request_note = Column(Text, nullable=False)
    status = Column(String(50), default="pending") # pending, approved, completed, cancelled, rejected
    safe_handover_details = Column(String(255), nullable=True) # e.g. "Available for pickup at Thanjavur Town Library Counter 2"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    book = relationship("BookListing", back_populates="requests")
    student = relationship("User", back_populates="book_requests")

class MentorProfile(Base):
    __tablename__ = "mentor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    display_name = Column(String(255), nullable=False)
    headline = Column(String(255), nullable=False)
    bio = Column(Text, nullable=False)
    expertise_areas = Column(JSON, default=list) # e.g. ["Computer Science", "Rural Entrepreneurship", "Civil Services"]
    languages_spoken = Column(JSON, default=list) # e.g. ["English", "Tamil"]
    available_topics = Column(JSON, default=list) # e.g. ["Resume Review", "Entrance Exam Strategy", "College Selection"]
    is_verified = Column(Boolean, default=False)
    verification_notes = Column(String(255), nullable=True)
    max_monthly_mentees = Column(Integer, default=5)
    safety_guidelines_acknowledged = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="mentor_profile")
    requests = relationship("MentorshipRequest", back_populates="mentor", cascade="all, delete-orphan")

class MentorshipRequest(Base):
    __tablename__ = "mentorship_requests"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("mentor_profiles.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic = Column(String(255), nullable=False)
    student_goals = Column(Text, nullable=False)
    preferred_language = Column(String(50), default="English")
    status = Column(String(50), default="pending") # pending, accepted, declined, completed
    mentor_response_message = Column(Text, nullable=True)
    safety_notes = Column(String(255), default="All sessions are platform-mediated and adhere to youth protection protocols.")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    mentor = relationship("MentorProfile", back_populates="requests")
    student = relationship("User", foreign_keys=[student_id], back_populates="mentorship_requests")

class FacilitatorAssignment(Base):
    __tablename__ = "facilitator_assignments"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    school_or_center_name = Column(String(255), nullable=False)
    status = Column(String(50), default="active") # active, archived
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)

    guidance_records = relationship("GuidanceRecord", back_populates="assignment", cascade="all, delete-orphan")

class GuidanceRecord(Base):
    __tablename__ = "guidance_records"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("facilitator_assignments.id", ondelete="CASCADE"), nullable=False)
    note = Column(Text, nullable=False)
    recommended_pathway_title = Column(String(255), nullable=True)
    recommended_opportunity_id = Column(Integer, nullable=True)
    is_private_to_facilitator = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    assignment = relationship("FacilitatorAssignment", back_populates="guidance_records")

class SyncAuditLog(Base):
    __tablename__ = "sync_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(Integer, nullable=True)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
