import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { MentorProfile, MentorshipRequest } from '../types';
import { EmptyState, ErrorState, LoadingState } from '../components/common/RequestState';
import { 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Globe, 
  MessageSquare, 
  X, 
  AlertCircle, 
  HelpCircle,
  Sparkles,
  Inbox
} from 'lucide-react';

interface ArohanConnectProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const ArohanConnect: React.FC<ArohanConnectProps> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [myRequests, setMyRequests] = useState<MentorshipRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'mentors' | 'requests'>('mentors');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestFetchError, setRequestFetchError] = useState<string | null>(null);

  // Request modal state
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [topic, setTopic] = useState('');
  const [studentGoals, setStudentGoals] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('Tamil');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchMentors = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await api.getMentors();
      setMentors(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Could not load mentor profiles. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!user) return;
    setIsLoadingRequests(true);
    setRequestFetchError(null);
    try {
      const reqs = await api.getMyMentorshipRequests();
      setMyRequests(reqs);
    } catch (err) {
      setRequestFetchError(err instanceof Error ? err.message : 'Could not load your mentorship requests. Please retry.');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchMentors();
    if (user) {
      fetchRequests();
    }
  }, [activeTab]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await api.requestMentorship(selectedMentor.id, {
        topic,
        student_goals: studentGoals,
        preferred_language: preferredLanguage
      });
      setSelectedMentor(null);
      setTopic('');
      setStudentGoals('');
      setSuccessBanner(`Mentorship request submitted to ${selectedMentor.display_name}. All communication is platform-mediated.`);
      fetchRequests();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not submit the mentorship request. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Arohan Connect
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
              Youth Protection Protocol Enabled
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Platform-Mediated Mentorship from Rural Pioneers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Seek guidance on college admissions, civil service exams, and STEM scholarships from professionals who understand the rural journey. All sessions are strictly monitored.
          </p>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Minor Safeguarding & Platform Mediation Notice:</p>
          <p className="mt-0.5 leading-relaxed text-blue-800">
            To safeguard minor students, private phone numbers and email addresses are never exchanged. Unsupervised offline meetings between minors and adults are strictly prohibited under Arohan's youth safety protocol.
          </p>
        </div>
      </div>

      {successBanner && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} aria-label="Dismiss success message" className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Switcher */}
      <div role="group" aria-label="Mentorship views" className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('mentors')}
          aria-pressed={activeTab === 'mentors'}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'mentors'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Mentor Profiles Directory
        </button>
        {user && (
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            aria-pressed={activeTab === 'requests'}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>My Guidance Requests ({myRequests.length})</span>
          </button>
        )}
      </div>

      {/* Tab 1: Mentor Directory */}
      {activeTab === 'mentors' && (
        <div>
          {isLoading ? (
            <LoadingState label="Loading mentor profiles..." />
          ) : fetchError ? (
            <ErrorState message={fetchError} onRetry={fetchMentors} />
          ) : mentors.length === 0 ? (
            <EmptyState title="No mentor profiles available" description="Please check back later for verified mentors." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mentors.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {m.display_name}
                        </h3>
                        <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                          {m.headline}
                        </p>
                      </div>

                      {m.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified Mentor</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                          Community Profile
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {m.bio}
                    </p>

                    {/* Expertise Areas */}
                    <div className="mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Core Expertise
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.expertise_areas?.map((exp, eIdx) => (
                          <span
                            key={eIdx}
                            className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Available Topics */}
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Guidance Topics Offered
                      </span>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {m.available_topics?.map((top, tIdx) => (
                          <li key={tIdx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{top}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Languages */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100 mb-4">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Languages: {m.languages_spoken?.join(', ') || 'Tamil, English'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) onOpenAuth('login');
                      else setSelectedMentor(m);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Request Platform-Mediated Guidance</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Guidance Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Your Mentorship Interactions</h3>
          {isLoadingRequests ? (
            <LoadingState label="Loading your mentorship requests..." />
          ) : requestFetchError ? (
            <ErrorState message={requestFetchError} onRetry={fetchRequests} />
          ) : myRequests.length === 0 ? (
            <EmptyState title="No mentorship requests yet" description="Open a mentor profile to ask for guidance." actionLabel="Browse mentors" onAction={() => setActiveTab('mentors')} />
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Mentor: {req.mentor_name}
                      </h4>
                      <p className="text-[11px] text-blue-600 font-semibold">{req.topic}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <strong>Your Question:</strong> {req.student_goals}
                  </p>

                  {req.mentor_response_message && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                      <p className="font-bold mb-0.5">Mentor Advice & Guidance:</p>
                      <p className="leading-relaxed">{req.mentor_response_message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Request Modal */}
      {selectedMentor && (
        <div role="dialog" aria-modal="true" aria-labelledby="mentorship-request-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 id="mentorship-request-title" className="font-bold text-slate-900 text-sm">Request Mentorship Guidance</h3>
                <p className="text-[11px] text-slate-500">With {selectedMentor.display_name}</p>
              </div>
              <button type="button" onClick={() => setSelectedMentor(null)} aria-label="Close mentorship request" className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && <p role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</p>}

            <form onSubmit={handleSubmitRequest} className="space-y-3.5 text-xs">
              <div>
                <label htmlFor="mentorship-topic" className="block font-bold text-slate-700 mb-1">Guidance Topic *</label>
                <input
                  id="mentorship-topic"
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Higher Secondary Stream Selection"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="mentorship-goals" className="block font-bold text-slate-700 mb-1">What specific advice are you looking for? *</label>
                <textarea
                  id="mentorship-goals"
                  rows={3}
                  required
                  value={studentGoals}
                  onChange={(e) => setStudentGoals(e.target.value)}
                  placeholder="I am trying to decide whether to take science group or diploma in electrical..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none resize-none"
                />
              </div>

              <div>
                <label htmlFor="mentorship-language" className="block font-bold text-slate-700 mb-1">Preferred Language</label>
                <select
                  id="mentorship-language"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                >
                  <option value="Tamil">தமிழ் (Tamil)</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-[10px]">
                Guidance will be provided securely through this platform in compliance with child safety standards.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !topic.trim() || !studentGoals.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition"
                >
                  {isSubmitting ? 'Sending...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
