from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
import datetime

# --- Authentication & User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "student"
    preferred_language: str = "en"
    district: Optional[str] = None
    state: Optional[str] = "Tamil Nadu"

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_language: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    phone: Optional[str] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

# --- Student Profile Schemas ---
class StudentProfileBase(BaseModel):
    current_class_or_year: str = "Class 10" # Class 9, Class 10, Class 11, Class 12, UG Year 1, UG Year 2, UG Year 3, Graduate
    stream_or_major: Optional[str] = None
    favorite_subjects: List[str] = []
    interests: List[str] = []
    hobbies_and_activities: List[str] = []
    skills: List[str] = []
    career_aspirations: List[str] = []
    family_income_range: Optional[str] = None
    location_type: str = "rural" # rural, semi-urban, urban
    willingness_to_relocate: str = "nearby_only" # yes, nearby_only, no
    preferred_learning_mode: str = "mixed" # practical, academic, vocational, mixed
    accessibility_needs: Optional[str] = None

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileUpdate(BaseModel):
    current_class_or_year: Optional[str] = None
    stream_or_major: Optional[str] = None
    favorite_subjects: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    hobbies_and_activities: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    career_aspirations: Optional[List[str]] = None
    family_income_range: Optional[str] = None
    location_type: Optional[str] = None
    willingness_to_relocate: Optional[str] = None
    preferred_learning_mode: Optional[str] = None
    accessibility_needs: Optional[str] = None

class StudentProfileOut(StudentProfileBase):
    id: int
    user_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# --- Career Discovery & Pathways ---
class AlternativePathway(BaseModel):
    title: str
    summary: str
    route_type: str

class CareerPathwayOut(BaseModel):
    id: Optional[int] = None
    title: str
    category: str # academic, vocational, public_service, creative, entrepreneurship, technical
    summary: str
    why_it_matches: str
    educational_prerequisites: str
    typical_duration: str
    estimated_cost_range: str
    known_uncertainties: Optional[str] = None
    suggested_first_step: str
    alternative_pathways: List[Dict[str, str]] = []
    source_references: List[Dict[str, str]] = []
    is_demo_mode: bool = False

    model_config = ConfigDict(from_attributes=True)

class CareerRecommendationResponse(BaseModel):
    recommendations: List[CareerPathwayOut]
    is_demo_mode: bool
    rationale: str
    timestamp: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))

# --- Roadmap Schemas ---
class RoadmapStepBase(BaseModel):
    step_order: int
    title: str
    description: str
    is_required: bool = True
    estimated_duration: Optional[str] = None
    key_skills_or_exams: List[str] = []
    official_source_url: Optional[str] = None
    official_source_name: Optional[str] = None
    is_completed: bool = False
    saved_next_action: Optional[str] = None

class RoadmapStepUpdate(BaseModel):
    is_completed: Optional[bool] = None
    saved_next_action: Optional[str] = None

class RoadmapStepOut(RoadmapStepBase):
    id: int
    roadmap_id: int
    completed_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)

class SavedRoadmapCreate(BaseModel):
    pathway_title: str
    pathway_category: str = "general"
    target_role: Optional[str] = None
    steps: List[RoadmapStepBase]

class SavedRoadmapOut(BaseModel):
    id: int
    user_id: int
    pathway_title: str
    pathway_category: str
    target_role: Optional[str] = None
    progress_percent: float
    is_active: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime
    steps: List[RoadmapStepOut] = []

    model_config = ConfigDict(from_attributes=True)

# --- Opportunity Schemas ---
class OpportunityBase(BaseModel):
    title: str
    category: str
    issuing_organization: str
    description: str
    official_source_url: str
    application_url: Optional[str] = None
    eligibility_criteria: Dict[str, Any] = {}
    required_documents: List[str] = []
    start_date: Optional[str] = None
    closing_date: Optional[str] = None
    verification_status: str = "verified" # verified, awaiting_verification, sample_demo
    state_applicability: str = "All India"
    education_stage_applicability: List[str] = []

class OpportunityOut(OpportunityBase):
    id: int
    last_verified_at: datetime.datetime
    is_active: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class EligibilityCheckResult(BaseModel):
    opportunity_id: int
    status: str
    reasons: List[str]
    missing_criteria: List[str] = []
    disclaimer: str = "Eligibility results are calculated deterministically against known criteria. Official terms published on the source portal prevail."

# --- BookBridge Schemas ---
class BookListingBase(BaseModel):
    title: str
    author: Optional[str] = None
    subject: str
    class_or_exam: str
    language: str = "English"
    edition: Optional[str] = None
    condition: str = "good"
    general_pickup_area: str
    collection_point_name: str = "Local Panchayat Library / Community Center"
    image_url: Optional[str] = None
    notes: Optional[str] = None

class BookListingCreate(BookListingBase):
    pass

class BookListingOut(BookListingBase):
    id: int
    donor_id: int
    donor_name: Optional[str] = None
    status: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class BookRequestCreate(BaseModel):
    book_id: Optional[int] = None
    request_note: str

class BookRequestStatusUpdate(BaseModel):
    status: str
    safe_handover_details: Optional[str] = None

class BookRequestOut(BaseModel):
    id: int
    book_id: int
    book_title: Optional[str] = None
    student_id: int
    student_name: Optional[str] = None
    request_note: str
    status: str
    safe_handover_details: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# --- Mentor & Arohan Connect Schemas ---
class MentorProfileBase(BaseModel):
    display_name: str
    headline: str
    bio: str
    expertise_areas: List[str] = []
    languages_spoken: List[str] = ["English", "Tamil"]
    available_topics: List[str] = []
    max_monthly_mentees: int = 5

class MentorProfileCreate(MentorProfileBase):
    pass

class MentorProfileOut(MentorProfileBase):
    id: int
    user_id: int
    is_verified: bool
    verification_notes: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class MentorshipRequestCreate(BaseModel):
    mentor_id: Optional[int] = None
    topic: str
    student_goals: str
    preferred_language: str = "English"

class MentorshipRequestStatusUpdate(BaseModel):
    status: str
    mentor_response_message: Optional[str] = None

class MentorshipRequestOut(BaseModel):
    id: int
    mentor_id: int
    mentor_name: Optional[str] = None
    student_id: int
    student_name: Optional[str] = None
    topic: str
    student_goals: str
    preferred_language: str
    status: str
    mentor_response_message: Optional[str] = None
    safety_notes: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# --- Facilitator / Teacher Schemas ---
class GuidanceRecordCreate(BaseModel):
    assignment_id: int
    note: str
    recommended_pathway_title: Optional[str] = None
    recommended_opportunity_id: Optional[int] = None
    is_private_to_facilitator: bool = False

class GuidanceRecordOut(BaseModel):
    id: int
    assignment_id: int
    note: str
    recommended_pathway_title: Optional[str] = None
    recommended_opportunity_id: Optional[int] = None
    is_private_to_facilitator: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class FacilitatorStudentSummary(BaseModel):
    assignment_id: int
    student_id: int
    student_name: str
    student_email: str
    school_or_center_name: str
    current_class_or_year: Optional[str] = None
    favorite_subjects: List[str] = []
    interests: List[str] = []
    active_roadmaps_count: int = 0
    latest_roadmap_progress: float = 0.0
    guidance_notes_count: int = 0
    assigned_at: datetime.datetime

# --- AI Interactive Chat Schemas ---
class ChatMessage(BaseModel):
    role: str
    content: str

class AIChatRequest(BaseModel):
    messages: List[ChatMessage]
    student_context: Optional[StudentProfileBase] = None

class AIChatResponse(BaseModel):
    message: str
    suggested_actions: List[str] = []
    identified_pathways: List[str] = []
    is_demo_mode: bool = False
