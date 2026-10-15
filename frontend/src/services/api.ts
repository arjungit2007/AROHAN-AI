import {
  User,
  StudentProfile,
  CareerRecommendationResponse,
  SavedRoadmap,
  RoadmapStep,
  Opportunity,
  EligibilityResult,
  BookListing,
  BookRequest,
  MentorProfile,
  MentorshipRequest,
  FacilitatorStudentSummary,
  GuidanceRecord
} from '../types';

export function getBaseApiUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (envUrl) {
    const sanitized = envUrl.replace(/\/+$/, '');
    if (sanitized.endsWith('/api/v1')) return sanitized;
    if (sanitized.endsWith('/api')) return `${sanitized}/v1`;
    return `${sanitized}/api/v1`;
  }
  // When running in a browser environment
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || '';
    // If running on local machine (dev server, preview, or jsdom test), point to default local FastAPI backend
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '') {
      return 'http://localhost:8000/api/v1';
    }
    // For production hosting on custom domain or full-stack proxy
    if (window.location.origin) {
      return `${window.location.origin}/api/v1`;
    }
  }
  return 'http://localhost:8000/api/v1';
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('arohan_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('arohan_token', token);
    } else {
      localStorage.removeItem('arohan_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const baseUrl = getBaseApiUrl();
    const targetUrl = `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(targetUrl, config);
      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      
      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;
        try {
          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
          } else {
            const text = await response.text();
            if (text.includes('<!doctype') || text.includes('<html')) {
              if (response.status === 404) {
                errorMessage = `API endpoint '${endpoint}' was not found on backend (HTTP 404).`;
              } else if (response.status >= 500) {
                errorMessage = `Backend server returned HTTP ${response.status} (Service Unavailable). Please verify the backend service is running.`;
              } else {
                errorMessage = `Server returned an HTML error page (HTTP ${response.status}).`;
              }
            } else if (text.trim()) {
              errorMessage = text.slice(0, 150);
            }
          }
        } catch {
          // Keep default errorMessage
        }
        throw new Error(errorMessage);
      }

      // If response is OK (200..299), verify that it is actually JSON and not an SPA index.html fallback
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        if (text.includes('<!doctype') || text.includes('<html')) {
          throw new Error(
            `API endpoint '${endpoint}' returned an HTML page instead of JSON. The backend server at ${baseUrl} may be stopped, unreachable, or misconfigured with SPA fallback.`
          );
        }
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(`Invalid response format received from ${endpoint}. Expected JSON.`);
        }
      }

      return await response.json();
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message?.toLowerCase().includes('fetch')) {
        const networkError = new Error(
          `Could not connect to the Arohan AI backend at ${baseUrl}. Please ensure the backend server is running on port 8000.`
        );
        console.error(`API Network Error on ${endpoint}:`, networkError.message);
        throw networkError;
      }
      console.error(`API Error on ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Auth
  async register(data: any): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(data: any): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async updateUserProfile(data: any): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(): Promise<{ status: string; message: string }> {
    const res = await this.request<{ status: string; message: string }>('/auth/account', {
      method: 'DELETE',
    });
    this.setToken(null);
    return res;
  }

  // Student Profile & Dashboard
  async getStudentProfile(): Promise<StudentProfile> {
    return this.request<StudentProfile>('/students/profile');
  }

  async updateStudentProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    return this.request<StudentProfile>('/students/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getStudentDashboard(): Promise<any> {
    return this.request<any>('/students/dashboard');
  }

  // AI & Career Matching
  async recommendPathways(profile?: Partial<StudentProfile>): Promise<CareerRecommendationResponse> {
    return this.request<CareerRecommendationResponse>('/ai/recommend', {
      method: 'POST',
      body: profile ? JSON.stringify(profile) : JSON.stringify({}),
    });
  }

  async chatWithAI(messages: Array<{ role: string; content: string }>, studentContext?: any): Promise<any> {
    return this.request<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, student_context: studentContext }),
    });
  }

  // Roadmaps
  async getRoadmaps(): Promise<SavedRoadmap[]> {
    return this.request<SavedRoadmap[]>('/roadmaps');
  }

  async getRoadmapDetail(id: number): Promise<SavedRoadmap> {
    return this.request<SavedRoadmap>(`/roadmaps/${id}`);
  }

  async createRoadmapFromPathway(pathwayTitle: string, category: string = 'general'): Promise<SavedRoadmap> {
    return this.request<SavedRoadmap>(
      `/roadmaps/from-pathway?pathway_title=${encodeURIComponent(pathwayTitle)}&pathway_category=${encodeURIComponent(category)}`,
      { method: 'POST' }
    );
  }

  async updateRoadmapStep(stepId: number, data: { is_completed?: boolean; saved_next_action?: string }): Promise<RoadmapStep> {
    return this.request<RoadmapStep>(`/roadmaps/steps/${stepId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoadmap(id: number): Promise<any> {
    return this.request<any>(`/roadmaps/${id}`, { method: 'DELETE' });
  }

  // Opportunities
  async getOpportunities(params?: { q?: string; category?: string; state?: string; verification_status?: string }): Promise<Opportunity[]> {
    const urlParams = new URLSearchParams();
    if (params?.q) urlParams.append('q', params.q);
    if (params?.category) urlParams.append('category', params.category);
    if (params?.state) urlParams.append('state', params.state);
    if (params?.verification_status) urlParams.append('verification_status', params.verification_status);

    const query = urlParams.toString() ? `?${urlParams.toString()}` : '';
    return this.request<Opportunity[]>(`/opportunities${query}`);
  }

  async getOpportunityDetail(id: number): Promise<Opportunity> {
    return this.request<Opportunity>(`/opportunities/${id}`);
  }

  async checkEligibility(id: number, profile?: Partial<StudentProfile>): Promise<EligibilityResult> {
    return this.request<EligibilityResult>(`/opportunities/${id}/check-eligibility`, {
      method: 'POST',
      body: profile ? JSON.stringify(profile) : JSON.stringify({}),
    });
  }

  // BookBridge
  async getBooks(params?: { q?: string; subject?: string; class_or_exam?: string; language?: string; status?: string }): Promise<BookListing[]> {
    const urlParams = new URLSearchParams();
    if (params?.q) urlParams.append('q', params.q);
    if (params?.subject) urlParams.append('subject', params.subject);
    if (params?.class_or_exam) urlParams.append('class_or_exam', params.class_or_exam);
    if (params?.language) urlParams.append('language', params.language);
    if (params?.status) urlParams.append('status', params.status);

    const query = urlParams.toString() ? `?${urlParams.toString()}` : '';
    return this.request<BookListing[]>(`/books${query}`);
  }

  async createBookListing(data: any): Promise<BookListing> {
    return this.request<BookListing>('/books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async requestBook(bookId: number, note: string): Promise<BookRequest> {
    return this.request<BookRequest>(`/books/${bookId}/request`, {
      method: 'POST',
      body: JSON.stringify({ request_note: note }),
    });
  }

  async getMyBookListings(): Promise<BookListing[]> {
    return this.request<BookListing[]>('/books/my/listings');
  }

  async getMyBookRequests(): Promise<BookRequest[]> {
    return this.request<BookRequest[]>('/books/my/requests');
  }

  async updateBookRequestStatus(requestId: number, status: string, handoverDetails?: string): Promise<BookRequest> {
    return this.request<BookRequest>(`/books/requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, safe_handover_details: handoverDetails }),
    });
  }

  // Arohan Connect Mentorship
  async getMentors(params?: { expertise?: string; language?: string; verified_only?: boolean }): Promise<MentorProfile[]> {
    const urlParams = new URLSearchParams();
    if (params?.expertise) urlParams.append('expertise', params.expertise);
    if (params?.language) urlParams.append('language', params.language);
    if (params?.verified_only) urlParams.append('verified_only', 'true');

    const query = urlParams.toString() ? `?${urlParams.toString()}` : '';
    return this.request<MentorProfile[]>(`/mentors${query}`);
  }

  async requestMentorship(mentorId: number, data: { topic: string; student_goals: string; preferred_language?: string }): Promise<MentorshipRequest> {
    return this.request<MentorshipRequest>(`/mentors/${mentorId}/request`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyMentorshipRequests(): Promise<MentorshipRequest[]> {
    return this.request<MentorshipRequest[]>('/mentors/my/requests');
  }

  async updateMentorshipRequest(requestId: number, status: string, message?: string): Promise<MentorshipRequest> {
    return this.request<MentorshipRequest>(`/mentors/requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, mentor_response_message: message }),
    });
  }

  // Facilitator
  async getFacilitatorStudents(): Promise<FacilitatorStudentSummary[]> {
    return this.request<FacilitatorStudentSummary[]>('/facilitator/students');
  }

  async getFacilitatorStudentDetail(studentId: number): Promise<any> {
    return this.request<any>(`/facilitator/students/${studentId}`);
  }

  async addFacilitatorGuidance(data: { assignment_id: number; note: string; recommended_pathway_title?: string; is_private_to_facilitator?: boolean }): Promise<GuidanceRecord> {
    return this.request<GuidanceRecord>('/facilitator/guidance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignStudentToFacilitator(studentEmail: string, schoolName: string): Promise<any> {
    return this.request<any>(
      `/facilitator/assign-student?student_email=${encodeURIComponent(studentEmail)}&school_name=${encodeURIComponent(schoolName)}`,
      { method: 'POST' }
    );
  }

  // System
  async getHealth(): Promise<any> {
    return this.request<any>('/health');
  }

  async seedDatabase(): Promise<any> {
    return this.request<any>('/health/seed', { method: 'POST' });
  }
}

export const api = new ApiService();
