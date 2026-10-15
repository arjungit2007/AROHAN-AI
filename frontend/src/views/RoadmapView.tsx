import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { api } from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import { SavedRoadmap, RoadmapStep } from '../types';
import { EmptyState, ErrorState, LoadingState } from '../components/common/RequestState';
import { 
  CheckCircle2, 
  Circle, 
  MapPin, 
  ExternalLink, 
  Clock, 
  Award, 
  Calendar, 
  Trash2, 
  Plus, 
  Sparkles,
  WifiOff,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface RoadmapViewProps {
  onExploreNewPathways: () => void;
  selectedPathwayToCreate?: { title: string; category: string } | null;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  onExploreNewPathways,
  selectedPathwayToCreate
}) => {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const [roadmaps, setRoadmaps] = useState<SavedRoadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<SavedRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingActionStepId, setEditingActionStepId] = useState<number | null>(null);
  const [actionText, setActionText] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadRoadmaps = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      if (isOnline && user) {
        // If an explicit pathway was passed to create
        if (selectedPathwayToCreate) {
          await api.createRoadmapFromPathway(selectedPathwayToCreate.title, selectedPathwayToCreate.category);
        }

        const data = await api.getRoadmaps();
        setRoadmaps(data);
        if (data.length > 0) {
          setActiveRoadmap(data[0]);
          // Cache each roadmap to IndexedDB for offline reading
          for (const rm of data) {
            await offlineStorage.cacheRoadmap(rm);
          }
        }
      } else {
        // Load from IndexedDB
        const cached = await offlineStorage.getCachedRoadmaps();
        setRoadmaps(cached);
        if (cached.length > 0) {
          setActiveRoadmap(cached[0]);
        }
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load your roadmaps. Showing saved offline copies if available.');
      try {
        const cached = await offlineStorage.getCachedRoadmaps();
        setRoadmaps(cached);
        setActiveRoadmap(cached.length > 0 ? cached[0] : null);
      } catch {
        setRoadmaps([]);
        setActiveRoadmap(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmaps();
  }, [isOnline, selectedPathwayToCreate]);

  const handleToggleStep = async (step: RoadmapStep) => {
    if (!activeRoadmap) return;
    const newStatus = !step.is_completed;

    // Optimistic UI update
    const updatedSteps = activeRoadmap.steps.map((s) =>
      s.id === step.id ? { ...s, is_completed: newStatus } : s
    );
    const completedCount = updatedSteps.filter((s) => s.is_completed).length;
    const newProgress = Math.round((completedCount / updatedSteps.length) * 100);

    const updatedRoadmap: SavedRoadmap = {
      ...activeRoadmap,
      steps: updatedSteps,
      progress_percent: newProgress
    };

    setActiveRoadmap(updatedRoadmap);
    setRoadmaps(roadmaps.map((r) => (r.id === updatedRoadmap.id ? updatedRoadmap : r)));

    // Cache locally
    await offlineStorage.cacheRoadmap(updatedRoadmap);

    // Sync to backend if online
    if (isOnline) {
      try {
        await api.updateRoadmapStep(step.id, { is_completed: newStatus });
      } catch (err) {
        setSyncError(err instanceof Error ? `Saved on this device, but not synced: ${err.message}` : 'Saved on this device, but could not sync to the server.');
      }
    }
  };

  const handleSaveAction = async (stepId: number) => {
    if (!activeRoadmap) return;
    const updatedSteps = activeRoadmap.steps.map((s) =>
      s.id === stepId ? { ...s, saved_next_action: actionText } : s
    );

    const updatedRoadmap = { ...activeRoadmap, steps: updatedSteps };
    setActiveRoadmap(updatedRoadmap);
    await offlineStorage.cacheRoadmap(updatedRoadmap);

    if (isOnline) {
      try {
        await api.updateRoadmapStep(stepId, { saved_next_action: actionText });
      } catch (err) {
        setSyncError(err instanceof Error ? `Saved on this device, but not synced: ${err.message}` : 'Saved on this device, but could not sync to the server.');
      }
    }
    setEditingActionStepId(null);
  };

  const handleDeleteRoadmap = async (id: number) => {
    if (!confirm('Are you sure you want to remove this roadmap?')) return;
    try {
      if (isOnline) {
        await api.deleteRoadmap(id);
      }
      const remaining = roadmaps.filter((r) => r.id !== id);
      setRoadmaps(remaining);
      setActiveRoadmap(remaining.length > 0 ? remaining[0] : null);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Could not delete this roadmap. Please retry.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <LoadingState label="Loading your personalized roadmap..." />
      </div>
    );
  }

  if (loadError && roadmaps.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <ErrorState message={loadError} onRetry={loadRoadmaps} />
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          title="No saved roadmaps yet"
          description="Complete the career discovery questionnaire or explore recommendations to build a step-by-step plan."
          actionLabel="Explore pathways"
          onAction={onExploreNewPathways}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Offline Alert */}
      {!isOnline && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center gap-2 text-xs">
          <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Offline Mode:</strong> Viewing your roadmaps cached in IndexedDB. Any completed steps will sync once connection returns.
          </span>
        </div>
      )}
      {loadError && <ErrorState message={loadError} onRetry={loadRoadmaps} />}
      {syncError && <ErrorState message={syncError} />}

      {/* Multiple Roadmaps Tabs */}
      {roadmaps.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {roadmaps.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRoadmap(r)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 border ${
                activeRoadmap?.id === r.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{r.pathway_title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeRoadmap?.id === r.id ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {r.progress_percent}%
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Active Roadmap Banner */}
      {activeRoadmap && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {activeRoadmap.pathway_category.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400 font-medium">Personalized Plan</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeRoadmap.pathway_title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeleteRoadmap(activeRoadmap.id)}
                aria-label={`Delete ${activeRoadmap.pathway_title} roadmap`}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                title="Remove this roadmap"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar & Metric */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Overall Milestone Progress</span>
              <span className="text-emerald-700">{activeRoadmap.progress_percent}% Completed</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${activeRoadmap.progress_percent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {activeRoadmap.steps.filter((s) => s.is_completed).length} of {activeRoadmap.steps.length} milestones checked off. Keep advancing steadily!
            </p>
          </div>

          {/* Sequential Step Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sequential Milestone Steps
            </h3>

            {activeRoadmap.steps.map((step, idx) => (
              <div
                key={step.id}
                className={`p-5 rounded-2xl border transition ${
                  step.is_completed
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Step Completion Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleStep(step)}
                    className="mt-0.5 shrink-0 focus:outline-none"
                    aria-label={step.is_completed ? 'Mark incomplete' : 'Mark completed'}
                    aria-pressed={step.is_completed}
                  >
                    {step.is_completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 hover:text-blue-600" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase">
                        STEP {idx + 1}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        step.is_required
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {step.is_required ? 'Required' : 'Recommended'}
                      </span>
                      {step.estimated_duration && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{step.estimated_duration}</span>
                        </span>
                      )}
                    </div>

                    <h4 className={`text-sm font-bold text-slate-900 mb-1 ${step.is_completed ? 'line-through text-slate-500' : ''}`}>
                      {step.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {step.description}
                    </p>

                    {/* Key skills or exams */}
                    {step.key_skills_or_exams && step.key_skills_or_exams.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {step.key_skills_or_exams.map((skill, skIdx) => (
                          <span
                            key={skIdx}
                            className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Official Source Link */}
                    {step.official_source_url && (
                      <div className="mb-3">
                        <a
                          href={step.official_source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                        >
                          <span>Resource: {step.official_source_name || 'Official Portal'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Saved Next Action Note */}
                    <div className="mt-3 pt-3 border-t border-slate-100/80">
                      {editingActionStepId === step.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            aria-label={`Next action for ${step.title}`}
                            type="text"
                            value={actionText}
                            onChange={(e) => setActionText(e.target.value)}
                            placeholder="e.g. Study chapter 3 on SWAYAM this Saturday..."
                            className="flex-1 text-xs px-3 py-1.5 border border-blue-400 rounded-lg outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveAction(step.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingActionStepId(null)}
                            className="px-2 py-1.5 text-xs text-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-700">Next Action:</span>
                            <span className="text-slate-600 italic">
                              {step.saved_next_action || 'No action note added yet.'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingActionStepId(step.id);
                              setActionText(step.saved_next_action || '');
                            }}
                            className="text-[11px] font-semibold text-blue-600 hover:underline"
                          >
                            {step.saved_next_action ? 'Edit Action' : '+ Add Action'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
