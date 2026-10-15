import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sparkles, 
  MapPin, 
  Award, 
  BookOpen, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  GraduationCap, 
  ShieldCheck,
  Compass,
  FileCheck
} from 'lucide-react';

interface LandingPageProps {
  onStartDiscovery: () => void;
  onExploreOpportunities: () => void;
  onExploreBookBridge: () => void;
  onExploreMentors: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDiscovery,
  onExploreOpportunities,
  onExploreBookBridge,
  onExploreMentors
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-5 pb-7 sm:pt-14 sm:pb-16 bg-gradient-to-b from-blue-50/70 via-slate-50 to-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AROHAN AI • Rural Student Pathways</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4 sm:mb-5">
            {t('headline')}
          </h1>

          <p className="text-sm sm:text-xl text-slate-600 max-w-3xl mx-auto mb-6 sm:mb-8 font-normal leading-relaxed">
            {t('heroSubhead')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <button
              onClick={onStartDiscovery}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition text-sm group"
            >
              <span>{t('getStarted')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreOpportunities}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-xs transition text-sm"
            >
              <Award className="w-4 h-4 text-purple-600" />
              <span>{t('exploreOpportunities')}</span>
            </button>
          </div>

          {/* Value Prop Badges */}
          <div className="mt-7 sm:mt-10 pt-5 sm:pt-8 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Stage-Specific</p>
                <p className="text-[11px] text-slate-500">Classes 9-10, 11-12, UG & Graduates</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">100% Sourced</p>
                <p className="text-[11px] text-slate-500">Official portals (NSP, SWAYAM, ITI)</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Zero Resale</p>
                <p className="text-[11px] text-slate-500">Free BookBridge textbook exchanges</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Offline PWA</p>
                <p className="text-[11px] text-slate-500">IndexedDB roadmap caching</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Journey Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">The Methodology</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{t('journeyTitle')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-2">
            A practical, structured sequence that turns vague aspirations into actionable, weekly progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {[
            { step: '01', title: 'Discover', desc: 'Identify natural interests and skills without score pressure.', icon: Compass, color: 'blue' },
            { step: '02', title: 'Compare', desc: 'Weigh academic, technical, agricultural, and vocational paths.', icon: Sparkles, color: 'purple' },
            { step: '03', title: 'Roadmap', desc: 'Milestone checklist with timeframes and study references.', icon: MapPin, color: 'emerald' },
            { step: '04', title: 'Support', desc: 'Apply to verified scholarships and borrow free books.', icon: Award, color: 'amber' },
            { step: '05', title: 'Action', desc: 'Weekly execution with safe mentor and teacher guidance.', icon: FileCheck, color: 'indigo' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-400">STEP {item.step}</span>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-700">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Feature Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Ecosystem Pillars</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Everything a Rural Learner Needs</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Career Matching */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Grounded AI Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Structured career matching grounded in realistic Indian opportunities. Identifies technical, vocational, public-service, and agricultural options based on your favorite subjects and goals.
              </p>
            </div>
            <button
              onClick={onStartDiscovery}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
            >
              <span>Start questionnaire</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: BookBridge */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">BookBridge Free Exchange</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Peer-to-peer textbook donation with zero payments. Collect and donate NCERT, State Board, NEET, and TNPSC books safely through local library and panchayat hub collection points.
              </p>
            </div>
            <button
              onClick={onExploreBookBridge}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-2"
            >
              <span>Browse available books</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Arohan Connect */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Arohan Connect Mentors</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Youth-protected mentorship from professionals with rural roots. Safe platform-mediated guidance on stream selection, entrance tests, and higher education.
              </p>
            </div>
            <button
              onClick={onExploreMentors}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 mt-2"
            >
              <span>Meet verified mentors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Target Audiences Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Designed for All Stages</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 mb-4">
              Tailored Guidance from High School to First Job
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span><strong>Classes 9–10:</strong> Stream selection, polytechnic vs 10+2, and NMMS scholarship.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span><strong>Classes 11–12:</strong> Competitive entrances, college counseling, and PM-YASASVI aid.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span><strong>Undergraduates:</strong> NAPS apprenticeships, SWAYAM certifications, and campus prep.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span><strong>Graduates:</strong> State PSC exams (TNPSC), banking tests, and micro-enterprises.</span>
              </div>
            </div>
            <button
              onClick={onStartDiscovery}
              className="mt-8 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl text-xs sm:text-sm hover:bg-slate-100 transition shadow-md"
            >
              Begin Student Assessment
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
