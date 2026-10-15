import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { CareerPathway, CareerRecommendationResponse } from '../types';
import { EmptyState, ErrorState, LoadingState } from '../components/common/RequestState';
import { 
  Sparkles, 
  MapPin, 
  Check, 
  Clock, 
  Coins, 
  HelpCircle, 
  ExternalLink, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  Layers, 
  X,
  MessageSquare,
  BookOpen,
  Filter
} from 'lucide-react';

interface CareerRecommendationsProps {
  onSelectRoadmap: (pathwayTitle: string, category: string) => void;
  onOpenChat: () => void;
  onRetakeQuestionnaire: () => void;
}

export const CareerRecommendations: React.FC<CareerRecommendationsProps> = ({
  onSelectRoadmap,
  onOpenChat,
  onRetakeQuestionnaire
}) => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<CareerRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<CareerPathway[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [compareMessage, setCompareMessage] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.recommendPathways(profile || undefined);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Could not load career pathways. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [profile]);

  const toggleCompare = (pathway: CareerPathway) => {
    setCompareMessage(null);
    if (selectedForCompare.some((p) => p.title === pathway.title)) {
      setSelectedForCompare(selectedForCompare.filter((p) => p.title !== pathway.title));
    } else {
      if (selectedForCompare.length >= 3) {
        setCompareMessage('Compare up to three pathways at a time. Remove one to add another.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, pathway]);
    }
  };

  const handleSaveRoadmap = (pathway: CareerPathway) => {
    onSelectRoadmap(pathway.title, pathway.category);
  };

  const pathways = data?.recommendations || [];
  const filteredPathways = activeCategoryFilter === 'all'
    ? pathways
    : pathways.filter((p) => p.category === activeCategoryFilter);

  const categories = ['all', 'technical', 'public_service', 'entrepreneurship', 'vocational', 'academic', 'creative'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Bar with Profile Summary & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {profile?.current_class_or_year || 'Student Profile'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Matched from your stated subjects & interests
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Recommended Career Pathways
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 transition"
          >
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span>AI Career Chat</span>
          </button>

          <button
            onClick={onRetakeQuestionnaire}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Update Profile
          </button>
        </div>
      </div>

      {/* Transparent Demo Mode / Provider Status Banner */}
      {data?.is_demo_mode && (
        <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Transparent Demo Mode:</strong> Recommendations generated using Arohan deterministic career matching rules based on Indian educational standards.
            </span>
          </div>
          <span className="text-[10px] font-bold bg-white text-blue-700 px-2 py-0.5 rounded border border-blue-200 shrink-0">
            Rule-Based Verified
          </span>
        </div>
      )}

      {compareMessage && <p role="status" className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{compareMessage}</p>}

      {/* Filter Category Pills */}
      <div role="group" aria-label="Filter career pathways" className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            aria-pressed={activeCategoryFilter === cat}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
              activeCategoryFilter === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Routes' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <LoadingState label="Analyzing career opportunities for your profile..." />
      )}

      {error && (
        <ErrorState message={error} onRetry={fetchRecommendations} />
      )}

      {!isLoading && !error && filteredPathways.length === 0 && (
        <EmptyState title="No pathways in this category" description="Choose another category or view every recommended route." actionLabel="View all routes" onAction={() => setActiveCategoryFilter('all')} />
      )}

      {/* Pathway Cards Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPathways.map((pathway, idx) => {
            const isComparing = selectedForCompare.some((p) => p.title === pathway.title);

            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge & Compare Toggle */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {pathway.category.replace('_', ' ')}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleCompare(pathway)}
                      aria-pressed={isComparing}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition flex items-center gap-1 ${
                        isComparing
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>{isComparing ? 'Comparing' : 'Compare'}</span>
                    </button>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mb-2">
                    {pathway.title}
                  </h3>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {pathway.summary}
                  </p>

                  {/* Why it matches */}
                  <div className="p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-900 mb-0.5">Why it matches your profile:</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{pathway.why_it_matches}</p>
                  </div>

                  {/* Practical Details Pills */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[10px] font-bold uppercase">Duration</span>
                      </div>
                      <p className="font-semibold text-slate-800 text-xs">{pathway.typical_duration}</p>
                    </div>

                    <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                        <Coins className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-bold uppercase">Estimated Cost</span>
                      </div>
                      <p className="font-semibold text-slate-800 text-xs">{pathway.estimated_cost_range}</p>
                    </div>
                  </div>

                  {/* Prerequisites */}
                  <div className="text-xs mb-3">
                    <span className="font-bold text-slate-800">Prerequisites: </span>
                    <span className="text-slate-600">{pathway.educational_prerequisites}</span>
                  </div>

                  {/* Known Uncertainties */}
                  {pathway.known_uncertainties && (
                    <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 text-[11px] text-amber-900 mb-3 flex items-start gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>What remains uncertain:</strong> {pathway.known_uncertainties}</span>
                    </div>
                  )}

                  {/* Suggested First Action */}
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 mb-4">
                    <span className="font-bold">Next Action: </span>
                    <span>{pathway.suggested_first_step}</span>
                  </div>

                  {/* Source Links */}
                  {pathway.source_references && pathway.source_references.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
                      <span className="text-slate-400 font-medium">Verified Sources:</span>
                      {pathway.source_references.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                        >
                          <span>{src.name}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Roadmap CTA */}
                <button
                  type="button"
                  onClick={() => handleSaveRoadmap(pathway)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50 mt-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Build & Save Personalized Roadmap</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Drawer / Modal */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-purple-500 shadow-2xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Side-by-Side Pathway Comparison ({selectedForCompare.length} Selected)
                </h3>
              </div>
              <button
                onClick={() => setSelectedForCompare([])}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedForCompare.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <button
                      onClick={() => toggleCompare(item)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  
                  <div>
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Duration</span>
                    <p className="font-semibold text-slate-800">{item.typical_duration}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Estimated Cost</span>
                    <p className="font-semibold text-slate-800">{item.estimated_cost_range}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Prerequisites</span>
                    <p className="text-slate-700">{item.educational_prerequisites}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Suggested First Step</span>
                    <p className="text-emerald-800 font-medium">{item.suggested_first_step}</p>
                  </div>

                  <button
                    onClick={() => handleSaveRoadmap(item)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                  >
                    Select this Pathway
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
