import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FacilitatorStudentSummary } from '../types';
import { EmptyState, ErrorState, LoadingState } from '../components/common/RequestState';
import { 
  GraduationCap, 
  Users, 
  MapPin, 
  Plus, 
  Search, 
  CheckCircle2, 
  BookOpen, 
  MessageSquare, 
  X, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<FacilitatorStudentSummary[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentListError, setStudentListError] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Guidance note form state
  const [newNote, setNewNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);
  const [recommendedPathway, setRecommendedPathway] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  // Assign modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [schoolName, setSchoolName] = useState('Govt Model Higher Secondary School');
  const [assignError, setAssignError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchStudents = async () => {
    setIsLoading(true);
    setStudentListError(null);
    try {
      const data = await api.getFacilitatorStudents();
      setStudents(data);
    } catch (err) {
      setStudentListError(err instanceof Error ? err.message : 'Could not load assigned students. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentDetail = async (id: number) => {
    setIsDetailLoading(true);
    setDetailError(null);
    setStudentDetail(null);
    setSelectedStudentId(id);
    try {
      const detail = await api.getFacilitatorStudentDetail(id);
      setStudentDetail(detail);
      setSelectedStudentId(id);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Could not load this student record. Please retry.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddGuidance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !newNote.trim()) return;
    
    // Find assignment id
    const summary = students.find((s) => s.student_id === selectedStudentId);
    if (!summary) return;

    setIsSubmittingNote(true);
    setNoteError(null);
    try {
      await api.addFacilitatorGuidance({
        assignment_id: summary.assignment_id,
        note: newNote.trim(),
        recommended_pathway_title: recommendedPathway.trim() || undefined,
        is_private_to_facilitator: false
      });
      setNoteSuccess(true);
      setNewNote('');
      setRecommendedPathway('');
      setTimeout(() => setNoteSuccess(false), 2000);
      fetchStudentDetail(selectedStudentId);
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : 'Could not save the guidance note. Please retry.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail.trim()) return;
    setIsAssigning(true);
    setAssignError(null);
    try {
      await api.assignStudentToFacilitator(newStudentEmail.trim(), schoolName);
      setIsAssignModalOpen(false);
      setNewStudentEmail('');
      fetchStudents();
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Could not link this student. Please retry.');
    } finally {
      setIsAssigning(false);
    }
  };

  if (user?.role !== 'teacher' && user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Restricted Faculty Portal</h2>
        <p className="text-xs text-slate-500 mt-1">
          This portal is reserved for authorized government school teachers and verified community facilitators.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Faculty & Facilitator Mode
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              Authorized Personnel
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Cohort Learning & Pathway Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Faculty: {user.full_name} • Monitoring {students.length} assigned students
          </p>
        </div>

        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Link Student to Cohort</span>
        </button>
      </div>

      {/* Main Grid: Student List & Detail Review Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Student List */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Assigned Students ({students.length})
          </h3>

          {isLoading ? (
            <LoadingState label="Loading assigned students..." />
          ) : studentListError ? (
            <ErrorState message={studentListError} onRetry={fetchStudents} />
          ) : students.length === 0 ? (
            <EmptyState title="No students linked" description="Link a registered student to start reviewing cohort progress." actionLabel="Link a student" onAction={() => setIsAssignModalOpen(true)} />
          ) : (
            <div className="space-y-2">
              {students.map((s) => (
                <button
                  key={s.student_id}
                  type="button"
                  onClick={() => fetchStudentDetail(s.student_id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition ${
                    selectedStudentId === s.student_id
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <p className="text-xs font-bold text-slate-900">{s.student_name}</p>
                    <span className="text-[10px] font-bold text-blue-600">
                      {s.latest_roadmap_progress}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{s.current_class_or_year || 'Stage unset'}</p>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">{s.school_or_center_name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Detailed Review & Guidance Tools */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs lg:col-span-2">
          {isDetailLoading ? (
            <LoadingState label="Loading student records..." />
          ) : detailError ? (
            <ErrorState message={detailError} onRetry={() => selectedStudentId && fetchStudentDetail(selectedStudentId)} />
          ) : studentDetail ? (
            <div className="space-y-6">
              {/* Student Bio Overview */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900">{studentDetail.full_name}</h2>
                  <p className="text-xs text-slate-500">
                    Stage: {studentDetail.profile?.current_class_or_year || 'Class 10'} • District: {studentDetail.district || 'Tamil Nadu'}
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Authorized Link
                </span>
              </div>

              {/* Profile Strengths & Subjects */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
                <div>
                  <span className="font-bold text-slate-700">Favorite Subjects: </span>
                  <span className="text-slate-600">
                    {studentDetail.profile?.favorite_subjects?.join(', ') || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Curiosity & Interests: </span>
                  <span className="text-slate-600">
                    {studentDetail.profile?.interests?.join(', ') || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Practical Skills: </span>
                  <span className="text-slate-600">
                    {studentDetail.profile?.skills?.join(', ') || 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Roadmaps and Milestones Progress */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Roadmap Execution & Milestones
                </h3>
                {studentDetail.roadmaps?.length > 0 ? (
                  <div className="space-y-3">
                    {studentDetail.roadmaps.map((rm: any) => (
                      <div key={rm.id} className="p-4 rounded-2xl border border-slate-200 text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-900">{rm.pathway_title}</span>
                          <span className="font-bold text-emerald-700">{rm.progress_percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                          <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${rm.progress_percent}%` }} />
                        </div>
                        <div className="space-y-1">
                          {rm.steps?.map((st: any) => (
                            <div key={st.id} className="flex items-center gap-2 text-[11px] text-slate-600">
                              <span className={`w-2 h-2 rounded-full ${st.is_completed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              <span className={st.is_completed ? 'line-through text-slate-400' : ''}>{st.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No active roadmaps created by this student yet.</p>
                )}
              </div>

              {/* Add Teacher Guidance Note Form */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Record Facilitator Guidance Note</span>
                </h3>

                {noteSuccess && (
                  <div className="p-2.5 mb-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Guidance note recorded and sent to student!</span>
                  </div>
                )}

                <form onSubmit={handleAddGuidance} className="space-y-3">
                  {noteError && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{noteError}</p>}
                  <textarea
                    id="guidance-note"
                    aria-label="Guidance note"
                    rows={2}
                    required
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter actionable guidance (e.g. recommend applying for NMMS scholarship or taking CS group)..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <input
                      id="guidance-pathway"
                      aria-label="Recommended pathway"
                      type="text"
                      value={recommendedPathway}
                      onChange={(e) => setRecommendedPathway(e.target.value)}
                      placeholder="Optional Recommended Pathway (e.g. Software & Web Application Developer)"
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingNote || !newNote.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0"
                    >
                      {isSubmittingNote ? 'Saving...' : 'Add Guidance'}
                    </button>
                  </div>
                </form>

                {/* Previous Guidance Notes History */}
                {studentDetail.guidance_notes?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Guidance History</p>
                    {studentDetail.guidance_notes.map((g: any) => (
                      <div key={g.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <p className="text-slate-800">"{g.note}"</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(g.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">Select a student from the left panel to review learning progress and advise.</p>
            </div>
          )}
        </div>
      </div>

      {/* Link Student Modal */}
      {isAssignModalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="assign-student-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 id="assign-student-title" className="font-bold text-slate-900 text-sm">Link Student to Your Cohort</h3>
              <button onClick={() => setIsAssignModalOpen(false)} aria-label="Close student link dialog" className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignError && <p role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{assignError}</p>}

            <form onSubmit={handleAssignStudent} className="space-y-3 text-xs">
              <div>
                <label htmlFor="assign-student-email" className="block font-bold text-slate-700 mb-1">Student Registered Email *</label>
                <input
                  id="assign-student-email"
                  type="email"
                  required
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="student@arohan.org"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="assign-school-name" className="block font-bold text-slate-700 mb-1">School / Center Name *</label>
                <input
                  id="assign-school-name"
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Government Higher Secondary School"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition"
                >
                  {isAssigning ? 'Linking...' : 'Link Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
