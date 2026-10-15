export type Role = 'student' | 'teacher' | 'mentor' | 'donor' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  preferred_language: string;
  district?: string;
  state?: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface StudentProfile {
  id?: number;
  user_id?: number;
  current_class_or_year: string;
  stream_or_major?: string;
  favorite_subjects: string[];
  interests: string[];
  hobbies_and_activities: string[];
  skills: string[];
  career_aspirations: string[];
  family_income_range?: string;
  location_type: 'rural' | 'semi-urban' | 'urban';
  willingness_to_relocate: 'yes' | 'nearby_only' | 'no';
  preferred_learning_mode: 'practical' | 'academic' | 'vocational' | 'mixed';
  accessibility_needs?: string;
}

export interface CareerPathway {
  id?: number;
  title: string;
  category: string;
  summary: string;
  why_it_matches: string;
  educational_prerequisites: string;
  typical_duration: string;
  estimated_cost_range: string;
  known_uncertainties?: string;
  suggested_first_step: string;
  alternative_pathways: Array<{ title: string; route?: string; summary?: string }>;
  source_references: Array<{ name: string; url: string }>;
  is_demo_mode?: boolean;
}

export interface CareerRecommendationResponse {
  recommendations: CareerPathway[];
  is_demo_mode: boolean;
  rationale: string;
  timestamp: string;
}

export interface RoadmapStep {
  id: number;
  roadmap_id: number;
  step_order: number;
  title: string;
  description: string;
  is_required: boolean;
  estimated_duration?: string;
  key_skills_or_exams: string[];
  official_source_url?: string;
  official_source_name?: string;
  is_completed: boolean;
  completed_at?: string;
  saved_next_action?: string;
}

export interface SavedRoadmap {
  id: number;
  user_id: number;
  pathway_title: string;
  pathway_category: string;
  target_role?: string;
  progress_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  steps: RoadmapStep[];
}

export interface Opportunity {
  id: number;
  title: string;
  category: 'scholarship' | 'government_scheme' | 'entrance_exam' | 'apprenticeship' | 'internship' | 'free_course';
  issuing_organization: string;
  description: string;
  official_source_url: string;
  application_url?: string;
  eligibility_criteria: Record<string, any>;
  required_documents: string[];
  start_date?: string;
  closing_date?: string;
  last_verified_at: string;
  verification_status: 'verified' | 'awaiting_verification' | 'sample_demo';
  state_applicability: string;
  education_stage_applicability: string[];
  is_active: boolean;
  created_at: string;
}

export interface EligibilityResult {
  opportunity_id: number;
  status: 'eligible' | 'potentially_eligible' | 'insufficient_information' | 'not_eligible';
  reasons: string[];
  missing_criteria: string[];
  disclaimer: string;
}

export interface BookListing {
  id: number;
  donor_id: number;
  donor_name?: string;
  title: string;
  author?: string;
  subject: string;
  class_or_exam: string;
  language: string;
  edition?: string;
  condition: 'like_new' | 'good' | 'fair';
  general_pickup_area: string;
  collection_point_name: string;
  image_url?: string;
  notes?: string;
  status: 'available' | 'reserved' | 'donated';
  created_at: string;
}

export interface BookRequest {
  id: number;
  book_id: number;
  book_title?: string;
  student_id: number;
  student_name?: string;
  request_note: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';
  safe_handover_details?: string;
  created_at: string;
  updated_at: string;
}

export interface MentorProfile {
  id: number;
  user_id: number;
  display_name: string;
  headline: string;
  bio: string;
  expertise_areas: string[];
  languages_spoken: string[];
  available_topics: string[];
  is_verified: boolean;
  verification_notes?: string;
  max_monthly_mentees: number;
  created_at: string;
}

export interface MentorshipRequest {
  id: number;
  mentor_id: number;
  mentor_name?: string;
  student_id: number;
  student_name?: string;
  topic: string;
  student_goals: string;
  preferred_language: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  mentor_response_message?: string;
  safety_notes: string;
  created_at: string;
  updated_at: string;
}

export interface FacilitatorStudentSummary {
  assignment_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  school_or_center_name: string;
  current_class_or_year?: string;
  favorite_subjects: string[];
  interests: string[];
  active_roadmaps_count: number;
  latest_roadmap_progress: number;
  guidance_notes_count: number;
  assigned_at: string;
}

export interface GuidanceRecord {
  id: number;
  assignment_id: number;
  note: string;
  recommended_pathway_title?: string;
  recommended_opportunity_id?: number;
  is_private_to_facilitator: boolean;
  created_at: string;
}
