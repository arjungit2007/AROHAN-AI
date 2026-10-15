import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { 
  Compass, 
  MapPin, 
  Award, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Globe, 
  Eye, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X,
  Type,
  LayoutDashboard
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { highContrast, toggleHighContrast, textSize, setTextSize } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'landing', label: t('navHome'), icon: Compass },
    { id: 'explore', label: t('navExplore'), icon: Compass },
    { id: 'roadmap', label: t('navRoadmaps'), icon: MapPin },
    { id: 'opportunities', label: t('navOpportunities'), icon: Award },
    { id: 'bookbridge', label: t('navBookBridge'), icon: BookOpen },
    { id: 'mentors', label: t('navMentors'), icon: Users },
  ];

  if (user?.role === 'teacher' || user?.role === 'admin') {
    navLinks.push({ id: 'teacher', label: t('navTeacher'), icon: GraduationCap });
  }

  if (user) {
    navLinks.push({ id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Logo & Tagline */}
          <button
            type="button"
            aria-label="Go to home"
            className="flex min-w-0 flex-none items-center gap-2 sm:gap-3 text-left cursor-pointer select-none"
            onClick={() => setCurrentTab('landing')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-sm">
              आ
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap font-bold text-base sm:text-lg text-slate-900">AROHAN AI</span>
                <span className="hidden sm:inline-flex text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full">
                  RURAL PATHWAYS
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block lg:hidden">
                {t('tagline')}
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav aria-label="Primary navigation" className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentTab(link.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Language, Accessibility, Auth */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex min-h-11 min-w-11 items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              title="Switch language between English and Tamil"
              aria-label={`Change interface language; current language: ${language === 'en' ? 'English' : 'Tamil'}`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Accessibility: High Contrast & Text Size */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={toggleHighContrast}
                aria-pressed={highContrast}
                className={`p-1.5 rounded text-xs transition ${
                  highContrast ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title={t('highContrast')}
                aria-label="Toggle high contrast"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  const sizes: ('normal' | 'large' | 'xl')[] = ['normal', 'large', 'xl'];
                  const nextIndex = (sizes.indexOf(textSize) + 1) % sizes.length;
                  setTextSize(sizes[nextIndex]);
                }}
                aria-label={`Text size: ${textSize}`}
                className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded"
                title={`Text Size: ${textSize}`}
              >
                <span className="flex items-center gap-0.5">
                  <Type className="w-3 h-3" />
                  <span className="text-[10px] uppercase">{textSize}</span>
                </span>
              </button>
            </div>

            {/* Auth Buttons / Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label={`Account menu for ${user.full_name}, ${user.role}`}
                  aria-expanded={userDropdownOpen}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-semibold text-slate-900 leading-tight">
                      {user.full_name.split(' ')[0]}
                    </div>
                    <span className="text-[10px] text-blue-600 uppercase font-bold">
                      {user.role}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium capitalize">
                        Role: {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      <span>{t('navDashboard')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab('settings');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <span>{t('navSettings')}</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        setCurrentTab('landing');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('navLogout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition"
                >
                  {t('navLogin')}
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('navRegister')}</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle mobile navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-primary-navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <nav id="mobile-primary-navigation" aria-label="Primary navigation" className="xl:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentTab(link.id);
                  setMobileMenuOpen(false);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-blue-600" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
};
