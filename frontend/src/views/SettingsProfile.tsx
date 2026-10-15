import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import { 
  User, 
  ShieldCheck, 
  Eye, 
  Type, 
  Trash2, 
  Globe, 
  CheckCircle2, 
  Database,
  Lock,
  AlertTriangle
} from 'lucide-react';

interface SettingsProfileProps {
  onAccountDeleted: () => void;
}

export const SettingsProfile: React.FC<SettingsProfileProps> = ({ onAccountDeleted }) => {
  const { user, refreshUser, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { highContrast, toggleHighContrast, textSize, setTextSize } = useAccessibility();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [district, setDistrict] = useState(user?.district || 'Thanjavur');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Account deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Seeding
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileError(null);
    try {
      await api.updateUserProfile({
        full_name: fullName,
        district,
        phone,
        preferred_language: language
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      refreshUser();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not update your profile. Please retry.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteAccount();
      setIsDeleteModalOpen(false);
      onAccountDeleted();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete your account. Please retry.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    setSeedError(null);
    try {
      const result = await api.seedDatabase();
      setSeedMessage(result.status === 'seeded_successfully'
        ? 'Hackathon sample data was added.'
        : 'Sample data already exists. No records were changed.');
      setTimeout(() => setSeedMessage(null), 5000);
    } catch (err) {
      setSeedError(err instanceof Error ? err.message : 'Could not restore demo data. Please retry.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Settings & Privacy</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal information, accessibility preferences, and privacy controls.
        </p>
      </div>

      {saveSuccess && (
        <div role="status" aria-live="polite" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}
      {profileError && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{profileError}</p>}

      {/* Section 1: Profile Details */}
      {user && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Personal Profile</span>
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
            <div>
              <label htmlFor="profile-email" className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                id="profile-email"
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="profile-name" className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="profile-district" className="block font-bold text-slate-700 mb-1">District</label>
                <input
                  id="profile-district"
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-phone" className="block font-bold text-slate-700 mb-1">Contact Phone (Optional - Kept Private)</label>
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-xs disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Section 2: Regional Language Selection */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-600" />
          <span>Regional Language Preference</span>
        </h2>
        <p className="text-xs text-slate-500">
          Select your primary interface language. Arohan AI supports English and Tamil with additional Indian languages structured for expansion.
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition flex items-center justify-between ${
              language === 'en'
                ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div>
              <p className="text-xs">English</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Primary English</p>
            </div>
            {language === 'en' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage('ta')}
            className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition flex items-center justify-between ${
              language === 'ta'
                ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div>
              <p className="text-xs">தமிழ் (Tamil)</p>
              <p className="text-[10px] text-slate-500 mt-0.5">தமிழ் இடைமுகம்</p>
            </div>
            {language === 'ta' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
          </button>
        </div>
      </div>

      {/* Section 3: Accessibility Settings */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-600" />
          <span>Accessibility Preferences</span>
        </h2>

        <div className="space-y-4 text-xs">
          {/* High Contrast */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="font-bold text-slate-800">High Contrast Mode</p>
              <p className="text-[11px] text-slate-500">Increases border and text contrast for low-visibility conditions</p>
            </div>
            <button
              onClick={toggleHighContrast}
              aria-pressed={highContrast}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                highContrast ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {highContrast ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Text Size */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-bold text-slate-800">Typography Scale</p>
              <p className="text-[11px] text-slate-500">Adjust overall reading font size across all screens</p>
            </div>
            <div className="flex items-center gap-1.5">
              {(['normal', 'large', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setTextSize(sz)}
                  aria-pressed={textSize === sz}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
                    textSize === sz ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Privacy & Data Retention Notice */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 text-xs text-slate-600 space-y-2">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Privacy & Minor Safeguards</span>
        </h2>
        <p className="leading-relaxed">
          AROHAN AI collects only essential information required to discover pathways and calculate deterministic eligibility for scholarships.
          We never sell student data, display third-party advertisements, or expose contact details publicly on BookBridge or Arohan Connect.
        </p>
      </div>

      {/* Section 5: Development & Seed Utilities */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-600" />
          <span>Hackathon Demo Data</span>
        </h2>
        <p className="text-xs text-slate-500">
          Add the sample accounts, profiles, roadmap, opportunities, books, and pending book request when the database is empty. Existing data is never reset or overwritten.
        </p>

        {seedMessage && (
          <p role="status" aria-live="polite" className="text-sm font-bold text-emerald-700">{seedMessage}</p>
        )}
        {seedError && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{seedError}</p>}

        <button
          onClick={handleSeedDatabase}
          disabled={isSeeding}
          className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition"
        >
          {isSeeding ? 'Checking sample data...' : 'Seed If Database Is Empty'}
        </button>
      </div>

      {/* Section 6: Permanent Account Deletion */}
      {user && (
        <div className="bg-red-50/60 rounded-3xl p-6 border border-red-200 space-y-3">
          <h2 className="text-sm font-bold text-red-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>Delete Account & Erase Personal Data</span>
          </h2>
          <p className="text-xs text-red-700 leading-relaxed">
            Permanently erases your user profile, saved roadmaps, book requests, and mentorship interactions in accordance with privacy rights. This action cannot be undone.
          </p>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
          >
            Delete My Account
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 id="delete-account-title" className="font-bold text-slate-900 text-base">Confirm Permanent Account Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Are you sure you want to delete your account? All student questionnaire answers, saved roadmaps, and BookBridge requests will be permanently deleted from the database.
            </p>
            {deleteError && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{deleteError}</p>}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
