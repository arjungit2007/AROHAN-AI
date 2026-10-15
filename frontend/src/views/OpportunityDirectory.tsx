import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Opportunity, EligibilityResult } from '../types';
import { EmptyState, ErrorState, LoadingState } from '../components/common/RequestState';
import { 
  Award, 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  Calendar, 
  X, 
  CheckCircle2, 
  Check, 
  Sparkles 
} from 'lucide-react';

export const OpportunityDirectory: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('All India');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [eligibilityMap, setEligibilityMap] = useState<Record<number, EligibilityResult>>({});
  const [isCheckingEligibility, setIsCheckingEligibility] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [eligibilityErrors, setEligibilityErrors] = useState<Record<number, string>>({});

  const fetchOpportunities = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await api.getOpportunities({
        q: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        state: selectedState !== 'All India' ? selectedState : undefined
      });
      setOpportunities(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Could not load opportunities. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedCategory, selectedState]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const checkEligibilityForOpp = async (opp: Opportunity) => {
    setIsCheckingEligibility(opp.id);
    setEligibilityErrors((previous) => ({ ...previous, [opp.id]: '' }));
    try {
      const result = await api.checkEligibility(opp.id, profile || undefined);
      setEligibilityMap((prev) => ({ ...prev, [opp.id]: result }));
    } catch (err) {
      setEligibilityErrors((previous) => ({
        ...previous,
        [opp.id]: err instanceof Error ? err.message : 'Could not check eligibility. Please retry.',
      }));
    } finally {
      setIsCheckingEligibility(null);
    }
  };

  const categories = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'scholarship', label: 'Scholarships' },
    { id: 'free_course', label: 'Free Online Courses' },
    { id: 'apprenticeship', label: 'Apprenticeships (NAPS)' },
    { id: 'government_scheme', label: 'Govt Schemes' },
    { id: 'entrance_exam', label: 'Entrance Exams' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Directory Title & Search */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div className="max-w-3xl mb-6">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Verified Opportunities & Schemes
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Government Scholarships, Free Courses & Apprenticeships
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Every entry is source-linked to official portals (NSP, SWAYAM, Skill India, NAPS) with deterministic eligibility checks.
          </p>
        </div>

        {/* Search Bar & Category Filters */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              aria-label="Search opportunities"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, provider, or keyword (e.g. Means-cum-Merit, SWAYAM, ITI)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div role="group" aria-label="Filter opportunities by category" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              aria-pressed={selectedCategory === c.id}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                selectedCategory === c.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {isLoading ? (
        <LoadingState label="Retrieving verified opportunity records..." />
      ) : fetchError ? (
        <ErrorState message={fetchError} onRetry={fetchOpportunities} />
      ) : opportunities.length === 0 ? (
        <EmptyState
          title="No matching opportunities"
          description="Try a broader search or clear the current filters."
          actionLabel="Clear filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSelectedState('All India');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp) => {
            const eligibility = eligibilityMap[opp.id];
            const isChecking = isCheckingEligibility === opp.id;

            return (
              <div
                key={opp.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Provenance Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {opp.category.replace('_', ' ')}
                    </span>

                    {/* Verification Status Badge */}
                    {opp.verification_status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified Portal</span>
                      </span>
                    ) : opp.verification_status === 'sample_demo' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Demo / Sample Data</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Awaiting Verification
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {opp.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 mb-3">
                    Provider: {opp.issuing_organization}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {opp.description}
                  </p>

                  {/* Dates & Applicability */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mb-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Closes: {opp.closing_date || 'Rolling / Open'}</span>
                    </div>
                    <div>
                      <span>State: <strong>{opp.state_applicability}</strong></span>
                    </div>
                  </div>

                  {/* Deterministic Eligibility Result or Trigger */}
                  <div className="mb-4">
                    {eligibilityErrors[opp.id] && (
                      <p role="alert" className="mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800">
                        {eligibilityErrors[opp.id]}
                      </p>
                    )}
                    {eligibility ? (
                      <div className={`p-3 rounded-xl border text-xs ${
                        eligibility.status === 'eligible'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : eligibility.status === 'not_eligible'
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : 'bg-blue-50 border-blue-200 text-blue-900'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          {eligibility.status === 'eligible' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="capitalize">{eligibility.status.replace('_', ' ')}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed mb-1">{eligibility.reasons[0]}</p>
                        <p className="text-[9px] text-slate-400 italic">{eligibility.disclaimer}</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isChecking}
                        onClick={() => checkEligibilityForOpp(opp)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isChecking ? 'Checking Rules...' : 'Check My Eligibility'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedOpp(opp)}
                    className="flex-1 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition text-center"
                  >
                    View Details & Requirements
                  </button>
                  <a
                    href={opp.official_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition"
                    title="Open official portal website"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Opportunity Detail Modal (Screen I) */}
      {selectedOpp && (
        <div role="dialog" aria-modal="true" aria-labelledby="opportunity-modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {selectedOpp.category.replace('_', ' ')}
                </span>
                <h3 id="opportunity-modal-title" className="font-black text-slate-900 text-lg sm:text-xl mt-1.5">
                  {selectedOpp.title}
                </h3>
                <p className="text-xs text-slate-500">{selectedOpp.issuing_organization}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOpp(null)}
                aria-label="Close opportunity details"
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Scheme Overview</h4>
                <p className="leading-relaxed">{selectedOpp.description}</p>
              </div>

              {/* Required Documents */}
              {selectedOpp.required_documents && selectedOpp.required_documents.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Required Documents (Verified Checklist)</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedOpp.required_documents.map((doc, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-2 text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Provenance and Verification Info */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900">
                <p className="font-bold mb-0.5">Verification & Provenance Notice:</p>
                <p>
                  Official URL: <a href={selectedOpp.official_source_url} target="_blank" rel="noopener noreferrer" className="underline font-semibold">{selectedOpp.official_source_url}</a>
                </p>
                <p className="mt-1 text-slate-500">
                  Last verified against official circular: {new Date(selectedOpp.last_verified_at).toLocaleDateString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Close
                </button>
                <a
                  href={selectedOpp.application_url || selectedOpp.official_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  <span>Open Official Application Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
