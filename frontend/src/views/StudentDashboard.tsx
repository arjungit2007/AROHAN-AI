import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  LayoutDashboard, 
  MapPin, 
  BookOpen, 
  Users, 
  Sparkles, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  GraduationCap
} from 'lucide-react';
import { ErrorState, LoadingState } from '../components/common/RequestState';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await api.getStudentDashboard();
      setData(res);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Could not load your dashboard. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <LoadingState label="Loading your student dashboard..." />
      </div>
    );
  }

  if (fetchError) {
    return <div className="max-w-5xl mx-auto px-4 py-10"><ErrorState message={fetchError} onRetry={fetchDashboard} /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
            Student Dashboard
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-1">
            Vanakkam, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Stage: {data?.profile?.current_class_or_year || 'Class 10'} • District: {user?.district || 'Tamil Nadu'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('explore')}
            className="px-4 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-100 transition shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Discover Pathways</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold">Active Roadmaps</span>
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{data?.roadmaps_count || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold">Book Requests</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{data?.book_requests_count || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold">Mentorships</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{data?.mentor_requests_count || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold">Profile Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs font-bold text-emerald-700 mt-2">
            {data?.profile_completed ? 'Completed' : 'Basic Skeleton'}
          </p>
        </div>
      </div>

      {/* Facilitator Guidance Notes if any */}
      {data?.facilitator_guidance && data.facilitator_guidance.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-blue-700" />
            <h3 className="font-bold text-blue-900 text-sm">Teacher & Facilitator Recommendations</h3>
          </div>
          <div className="space-y-3">
            {data.facilitator_guidance.map((note: any) => (
              <div key={note.id} className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
                <p className="text-xs text-slate-800 leading-relaxed font-medium">"{note.note}"</p>
                {note.recommended_pathway_title && (
                  <p className="text-[11px] font-bold text-blue-700 mt-1.5">
                    Recommended Pathway: {note.recommended_pathway_title}
                  </p>
                )}
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Roadmaps Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Active Roadmaps</span>
          </h3>
          <button
            onClick={() => onNavigate('roadmap')}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Open Roadmap Manager
          </button>
        </div>

        {data?.roadmaps && data.roadmaps.length > 0 ? (
          <div className="space-y-3">
            {data.roadmaps.map((r: any) => (
              <div key={r.id} className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{r.pathway_title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.completed_steps_count} of {r.steps_count} milestones completed ({r.progress_percent}%)
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('roadmap')}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 transition"
                >
                  Continue Plan
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-xs text-slate-500 mb-2">No active roadmaps created yet.</p>
            <button
              onClick={() => onNavigate('explore')}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
            >
              Discover Pathways
            </button>
          </div>
        )}
      </div>

      {/* Two Column Section: Book Requests & Mentorship */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Book Requests */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>BookBridge Requests</span>
            </h3>
            <button onClick={() => onNavigate('bookbridge')} className="text-xs font-bold text-purple-600 hover:underline">
              Browse Books
            </button>
          </div>

          {data?.recent_book_requests && data.recent_book_requests.length > 0 ? (
            <div className="space-y-2.5">
              {data.recent_book_requests.map((br: any) => (
                <div key={br.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 truncate max-w-[200px]">{br.book_title}</p>
                    <p className="text-[10px] text-slate-500">{new Date(br.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                    br.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {br.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3">No active book requests.</p>
          )}
        </div>

        {/* Mentorship Requests */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Mentorship Interactions</span>
            </h3>
            <button onClick={() => onNavigate('mentors')} className="text-xs font-bold text-emerald-600 hover:underline">
              Meet Mentors
            </button>
          </div>

          {data?.recent_mentor_requests && data.recent_mentor_requests.length > 0 ? (
            <div className="space-y-2.5">
              {data.recent_mentor_requests.map((mr: any) => (
                <div key={mr.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{mr.mentor_name}</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{mr.topic}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                    mr.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {mr.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3">No active mentor requests.</p>
          )}
        </div>
      </div>
    </div>
  );
};
