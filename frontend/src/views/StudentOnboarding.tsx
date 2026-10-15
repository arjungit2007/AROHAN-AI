import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { StudentProfile } from '../types';
import { VoiceInputModal } from '../components/voice/VoiceInputModal';
import { ErrorState } from '../components/common/RequestState';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Mic, 
  Check, 
  GraduationCap, 
  BookOpen, 
  Heart, 
  Wrench, 
  Compass, 
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface StudentOnboardingProps {
  onComplete: () => void;
}

export const StudentOnboarding: React.FC<StudentOnboardingProps> = ({ onComplete }) => {
  const { user, profile, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form State
  const [educationLevel, setEducationLevel] = useState<string>('Class 10');
  const [stream, setStream] = useState<string>('General (All Subjects)');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics', 'Science & Physics']);
  const [customSubject, setCustomSubject] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Computer Technology & Coding', 'Fixing electrical gadgets / appliances']);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Problem Solving', 'Fast Learner']);
  const [selectedAspirations, setSelectedAspirations] = useState<string[]>(['Software Engineer', 'Government Officer (TNPSC)']);
  const [incomeRange, setIncomeRange] = useState<string>('< 1.5 Lakhs');
  const [relocation, setRelocation] = useState<'yes' | 'nearby_only' | 'no'>('nearby_only');
  const [learningMode, setLearningMode] = useState<'practical' | 'academic' | 'vocational' | 'mixed'>('mixed');

  // Load existing profile if available
  useEffect(() => {
    if (profile) {
      if (profile.current_class_or_year) setEducationLevel(profile.current_class_or_year);
      if (profile.stream_or_major) setStream(profile.stream_or_major);
      if (profile.favorite_subjects?.length) {
        setSelectedSubjects(profile.favorite_subjects.map((subject) => ({
          Science: 'Science & Physics',
          Tamil: 'Tamil Language & Literature',
        })[subject] || subject));
      }
      if (profile.interests?.length) {
        setSelectedInterests(profile.interests.map((interest) => ({
          'Computer Technology': 'Computer Technology & Coding',
          Electronics: 'Fixing electrical gadgets / appliances',
          'Farming Innovation': 'Modern Farming & Irrigation',
        })[interest] || interest));
      }
      if (profile.skills?.length) {
        setSelectedSkills(profile.skills.map((skill) => ({
          'Basic Computer Literacy': 'Basic Computer Typing',
        })[skill] || skill));
      }
      if (profile.career_aspirations?.length) {
        setSelectedAspirations(profile.career_aspirations.map((aspiration) => ({
          'Solar Technician': 'Solar / Electrical Technician',
          'Government Officer': 'Government Officer (TNPSC)',
        })[aspiration] || aspiration));
      }
      if (profile.family_income_range) setIncomeRange(profile.family_income_range);
      if (profile.willingness_to_relocate) setRelocation(profile.willingness_to_relocate);
      if (profile.preferred_learning_mode) setLearningMode(profile.preferred_learning_mode);
    }
  }, [profile]);

  const toggleItem = (list: string[], setList: (items: string[]) => void, item: string) => {
    setValidationError(null);
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addCustomItem = (list: string[], setList: (items: string[]) => void, item: string) => {
    if (item.trim() && !list.includes(item.trim())) {
      setList([...list, item.trim()]);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    // Add voice transcript text to the current step's active attribute
    if (currentStep === 3) {
      addCustomItem(selectedSubjects, setSelectedSubjects, text);
    } else if (currentStep === 4) {
      addCustomItem(selectedInterests, setSelectedInterests, text);
    } else if (currentStep === 5) {
      addCustomItem(selectedSkills, setSelectedSkills, text);
    } else if (currentStep === 6) {
      addCustomItem(selectedAspirations, setSelectedAspirations, text);
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    setSaveError(null);
    const profilePayload: Partial<StudentProfile> = {
      current_class_or_year: educationLevel,
      stream_or_major: stream,
      favorite_subjects: selectedSubjects,
      interests: selectedInterests,
      skills: selectedSkills,
      career_aspirations: selectedAspirations,
      family_income_range: incomeRange,
      location_type: 'rural',
      willingness_to_relocate: relocation,
      preferred_learning_mode: learningMode,
    };

    try {
      if (user) {
        await updateProfile(profilePayload);
      }
      onComplete();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save your profile. Please retry.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalSteps = 6;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);
  const continueToNextStep = () => {
    const selectionsByStep: Record<number, number> = {
      3: selectedSubjects.length,
      4: selectedInterests.length,
      5: selectedSkills.length + selectedAspirations.length,
    };
    if ((selectionsByStep[currentStep] ?? 1) === 0) {
      setValidationError('Choose at least one option before continuing.');
      return;
    }
    setValidationError(null);
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header & Step Tracker */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-xs text-slate-500 font-semibold">{progressPercent}% Completed</span>
        </div>
        <div role="progressbar" aria-label="Questionnaire progress" aria-valuemin={0} aria-valuemax={totalSteps} aria-valuenow={currentStep} className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {saveError && <ErrorState message={saveError} onRetry={handleFinish} />}
      {validationError && <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{validationError}</p>}

      {/* Questionnaire Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm transition">
        {/* Step 1: Education Stage */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">What is your current education stage?</h2>
                <p className="text-xs text-slate-500">Every stage has unique opportunities and next steps.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {[
                { id: 'Class 9', label: 'Class 9', desc: 'Pre-Matric / Interest Discovery' },
                { id: 'Class 10', label: 'Class 10', desc: 'Board Exams / Stream Selection' },
                { id: 'Class 11', label: 'Class 11', desc: 'Higher Secondary / Entrance Prep' },
                { id: 'Class 12', label: 'Class 12', desc: 'Board Exams / College Counseling' },
                { id: 'UG Year 1-2', label: 'Undergraduate (Year 1–2)', desc: 'Foundations & Skill Certifications' },
                { id: 'UG Year 3', label: 'Undergraduate (Final Year)', desc: 'Internships, NAPS, Job Placement' },
                { id: 'Graduate', label: 'College Graduate', desc: 'Govt Exams, Employment & Masters' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEducationLevel(opt.id)}
                  aria-pressed={educationLevel === opt.id}
                  className={`p-3.5 rounded-xl border text-left transition flex items-start justify-between ${
                    educationLevel === opt.id
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                  {educationLevel === opt.id && <Check className="w-4 h-4 text-blue-600 mt-0.5" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Stream or Major */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">What is your academic stream or focus?</h2>
                <p className="text-xs text-slate-500">Helps match eligible courses, exams, and scholarships.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {[
                'General (All School Subjects)',
                'Science with Mathematics (PCM)',
                'Science with Biology (PCB)',
                'Computer Science & Maths',
                'Commerce with Accountancy',
                'Arts & Humanities',
                'Vocational / ITI / Polytechnic',
                'Agricultural Studies',
              ].map((str) => (
                <button
                  key={str}
                  type="button"
                  onClick={() => setStream(str)}
                  aria-pressed={stream === str}
                  className={`p-3 rounded-xl border text-left transition text-xs font-bold flex items-center justify-between ${
                    stream === str
                      ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs ring-1 ring-purple-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span>{str}</span>
                  {stream === str && <Check className="w-4 h-4 text-purple-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Favorite Subjects */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Which subjects do you enjoy studying?</h2>
                  <p className="text-xs text-slate-500">Select any that interest you, regardless of test marks.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="p-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50"
                aria-label="Speak your favorite subjects"
                title="Speak your favorite subjects"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {[
                'Mathematics',
                'Science & Physics',
                'Chemistry',
                'Biology & Nature',
                'Computer Science',
                'Tamil Language & Literature',
                'English',
                'History & Social Studies',
                'Economics & Commerce',
                'Agriculture & Farming',
              ].map((subj) => {
                const isSelected = selectedSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleItem(selectedSubjects, setSelectedSubjects, subj)}
                    aria-pressed={isSelected}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {subj}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <label htmlFor="custom-subject" className="sr-only">Add another subject or activity</label>
              <input
                id="custom-subject"
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Type another subject or activity..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (customSubject.trim()) {
                    addCustomItem(selectedSubjects, setSelectedSubjects, customSubject);
                    setCustomSubject('');
                  }
                }}
                className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Interests & Practical Hobbies */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">What activities spark your curiosity?</h2>
                  <p className="text-xs text-slate-500">Real-world activities uncover hidden vocational and technical aptitude.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="p-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {[
                'Fixing electrical gadgets / appliances',
                'Computer Technology & Coding',
                'Modern Farming & Irrigation',
                'Public Service & Community Leadership',
                'Teaching & Explaining Concepts',
                'Drawing, Design & Content Creation',
                'Business & Local Trading',
                'Healthcare & Assisting Patients',
                'Mechanical Tools & Driving',
              ].map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleItem(selectedInterests, setSelectedInterests, interest)}
                    aria-pressed={isSelected}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Practical Skills & Aspirations */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">What are your top skills and dream roles?</h2>
                  <p className="text-xs text-slate-500">Pick any career pathways you are excited to explore.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="p-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50"
                aria-label="Speak your interests"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Skills & Strengths</label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Problem Solving',
                  'Clear Communication',
                  'Hands-on Repairs',
                  'Basic Computer Typing',
                  'Fast Learner',
                  'Hardworking & Disciplined',
                  'Organizing Events',
                ].map((sk) => {
                  const isSelected = selectedSkills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleItem(selectedSkills, setSelectedSkills, sk)}
                      aria-pressed={isSelected}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                        isSelected ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {sk}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Career Aspirations</label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Software Engineer',
                  'Government Officer (TNPSC)',
                  'Solar / Electrical Technician',
                  'Agri-Business Founder',
                  'School Teacher',
                  'Nurse / Health Assistant',
                  'Police / Defense Forces',
                  'Bank Officer (IBPS)',
                ].map((asp) => {
                  const isSelected = selectedAspirations.includes(asp);
                  return (
                    <button
                      key={asp}
                      type="button"
                      onClick={() => toggleItem(selectedAspirations, setSelectedAspirations, asp)}
                      aria-pressed={isSelected}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                        isSelected ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {asp}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Constraints & Preferences */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Preferences & Constraints</h2>
                <p className="text-xs text-slate-500">We use this only to find relevant scholarships and local options.</p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Annual Family Income Bracket (for Scholarships)</label>
                <div className="grid grid-cols-2 gap-2">
                  {['< 1.5 Lakhs', '1.5 - 3 Lakhs', '3 - 6 Lakhs', '> 6 Lakhs'].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setIncomeRange(inc)}
                      aria-pressed={incomeRange === inc}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                        incomeRange === inc ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {inc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Willingness to Relocate for Study or Work</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'nearby_only', label: 'Nearby Towns Only' },
                    { id: 'yes', label: 'Anywhere in State' },
                    { id: 'no', label: 'Village / Home Only' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRelocation(r.id as any)}
                      aria-pressed={relocation === r.id}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                        relocation === r.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Learning Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'practical', label: 'Hands-on / Practical' },
                    { id: 'mixed', label: 'Balanced Mixed' },
                    { id: 'academic', label: 'Theoretical / Academic' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLearningMode(l.id as any)}
                      aria-pressed={learningMode === l.id}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                        learningMode === l.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={continueToNextStep}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSaving ? 'Synthesizing Pathways...' : 'Discover Career Pathways'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onTranscriptComplete={handleVoiceTranscript}
        initialPrompt="Speak your subject, activity, or skill..."
      />
    </div>
  );
};
