import React, { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { OfflineProvider, useOffline } from './context/OfflineContext';

import { Navbar } from './components/common/Navbar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { AuthModal } from './views/AuthModal';

import { LandingPage } from './views/LandingPage';
import { StudentOnboarding } from './views/StudentOnboarding';
import { CareerRecommendations } from './views/CareerRecommendations';
import { CareerDiscovery } from './views/CareerDiscovery';
import { RoadmapView } from './views/RoadmapView';
import { OpportunityDirectory } from './views/OpportunityDirectory';
import { BookBridge } from './views/BookBridge';
import { ArohanConnect } from './views/ArohanConnect';
import { TeacherDashboard } from './views/TeacherDashboard';
import { StudentDashboard } from './views/StudentDashboard';
import { SettingsProfile } from './views/SettingsProfile';

import { 
  X, 
  BookOpen, 
  Users, 
  GraduationCap, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  LogIn, 
  LogOut,
  WifiOff,
  Sparkles
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const { isOnline } = useOffline();

  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalInstance, setAuthModalInstance] = useState(0);
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState<boolean>(false);
  const moreDrawerRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const wasMoreDrawerOpen = useRef(false);
  const [selectedPathwayToCreate, setSelectedPathwayToCreate] = useState<{ title: string; category: string } | null>(null);

  useEffect(() => {
    if (isMoreDrawerOpen) {
      moreDrawerRef.current?.focus();
      wasMoreDrawerOpen.current = true;
    } else if (wasMoreDrawerOpen.current) {
      moreButtonRef.current?.focus();
      wasMoreDrawerOpen.current = false;
    }
  }, [isMoreDrawerOpen]);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalInstance((instance) => instance + 1);
    setAuthModalOpen(true);
  };

  const handleStartDiscovery = () => {
    setCurrentTab('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCurrentTab('explore');
  };

  const handleSelectRoadmap = (pathwayTitle: string, category: string) => {
    setSelectedPathwayToCreate({ title: pathwayTitle, category });
    setCurrentTab('roadmap');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors">
      {/* Offline Status Ribbon */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-1.5 shadow-xs">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode: You are offline. Showing cached roadmaps from IndexedDB.</span>
        </div>
      )}

      {import.meta.env.VITE_DEMO_MODE !== 'false' && (
        <aside aria-label="Hackathon demo data notice" className="flex flex-col items-start gap-1 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-slate-800 sm:flex-row sm:items-center sm:gap-3">
          <span className="inline-flex min-h-6 items-center rounded-sm bg-amber-800 px-2 font-bold text-white">HACKATHON DEMO</span>
          <span>Seeded profiles and transactions are sample data. Official schemes link to their portals; the sample grant is marked Demo.</span>
        </aside>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedPathwayToCreate(null);
          setCurrentTab(tab);
        }}
        onOpenAuth={openAuth}
      />

      {/* Active Screen Container */}
      <main className="flex-1 pb-20 lg:pb-8">
        {currentTab === 'landing' && (
          <LandingPage
            onStartDiscovery={handleStartDiscovery}
            onExploreOpportunities={() => setCurrentTab('opportunities')}
            onExploreBookBridge={() => setCurrentTab('bookbridge')}
            onExploreMentors={() => setCurrentTab('mentors')}
          />
        )}

        {currentTab === 'onboarding' && (
          <StudentOnboarding onComplete={handleOnboardingComplete} />
        )}

        {currentTab === 'explore' && (
          <CareerRecommendations
            onSelectRoadmap={handleSelectRoadmap}
            onOpenChat={() => setCurrentTab('chat')}
            onRetakeQuestionnaire={() => setCurrentTab('onboarding')}
          />
        )}

        {currentTab === 'chat' && (
          <CareerDiscovery
            onBackToRecommendations={() => setCurrentTab('explore')}
            onSelectPathwayRoadmap={(pTitle) => handleSelectRoadmap(pTitle, 'general')}
          />
        )}

        {currentTab === 'roadmap' && (
          <RoadmapView
            onExploreNewPathways={() => setCurrentTab('explore')}
            selectedPathwayToCreate={selectedPathwayToCreate}
          />
        )}

        {currentTab === 'opportunities' && <OpportunityDirectory />}

        {currentTab === 'bookbridge' && <BookBridge onOpenAuth={openAuth} />}

        {currentTab === 'mentors' && <ArohanConnect onOpenAuth={openAuth} />}

        {currentTab === 'teacher' && <TeacherDashboard />}

        {currentTab === 'dashboard' && (
          <StudentDashboard onNavigate={(tab) => setCurrentTab(tab)} />
        )}

        {currentTab === 'settings' && (
          <SettingsProfile onAccountDeleted={() => setCurrentTab('landing')} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedPathwayToCreate(null);
          setCurrentTab(tab);
        }}
        onOpenMore={() => setIsMoreDrawerOpen(true)}
        isMoreOpen={isMoreDrawerOpen}
        moreButtonRef={moreButtonRef}
      />

      {/* Mobile "More" Slide-Over Drawer */}
      {isMoreDrawerOpen && (
        <div
          id="more-navigation-drawer"
          ref={moreDrawerRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="More navigation options"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setIsMoreDrawerOpen(false);
              return;
            }
            if (event.key === 'Tab') {
              const focusable = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
              const first = focusable.item(0);
              const last = focusable.item(focusable.length - 1);
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }
          }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) setIsMoreDrawerOpen(false); }}
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs lg:hidden animate-in fade-in"
        >
          <div className="w-[min(20rem,88vw)] bg-white h-full p-5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    आ
                  </div>
                  <span className="font-bold text-slate-900 text-sm">AROHAN AI</span>
                </div>
                <button
                  onClick={() => setIsMoreDrawerOpen(false)}
                  aria-label="Close navigation drawer"
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav aria-label="More navigation options" className="space-y-1">
                <button
                  onClick={() => {
                    setCurrentTab('bookbridge');
                    setIsMoreDrawerOpen(false);
                  }}
                    aria-current={currentTab === 'bookbridge' ? 'page' : undefined}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${
                    currentTab === 'bookbridge' ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>BookBridge Textbook Sharing</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('mentors');
                    setIsMoreDrawerOpen(false);
                  }}
                    aria-current={currentTab === 'mentors' ? 'page' : undefined}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${
                    currentTab === 'mentors' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Arohan Connect Mentorship</span>
                </button>

                {(user?.role === 'teacher' || user?.role === 'admin') && (
                  <button
                    onClick={() => {
                      setCurrentTab('teacher');
                      setIsMoreDrawerOpen(false);
                    }}
                    aria-current={currentTab === 'teacher' ? 'page' : undefined}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${
                      currentTab === 'teacher' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Teacher & Faculty Portal</span>
                  </button>
                )}

                {user && (
                  <button
                    onClick={() => {
                      setCurrentTab('dashboard');
                      setIsMoreDrawerOpen(false);
                    }}
                    aria-current={currentTab === 'dashboard' ? 'page' : undefined}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${
                      currentTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    <span>Student Dashboard</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setCurrentTab('settings');
                    setIsMoreDrawerOpen(false);
                  }}
                    aria-current={currentTab === 'settings' ? 'page' : undefined}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${
                    currentTab === 'settings' ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4 text-slate-500" />
                  <span>Settings & Accessibility</span>
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMoreDrawerOpen(false);
                    setCurrentTab('landing');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsMoreDrawerOpen(false);
                      openAuth('login');
                    }}
                    className="py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreDrawerOpen(false);
                      openAuth('register');
                    }}
                    className="py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl text-center"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal
        key={authModalInstance}
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(role) => {
          if (authModalMode === 'register') {
            setCurrentTab('onboarding');
          } else if (role === 'teacher' || role === 'admin') {
            setCurrentTab('teacher');
          } else if (role === 'mentor') {
            setCurrentTab('mentors');
          } else if (role === 'donor') {
            setCurrentTab('bookbridge');
          } else {
            setCurrentTab('dashboard');
          }
        }}
      />

      {/* Footer */}
      <footer className="hidden lg:block border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 AROHAN AI • Every dream deserves a pathway.</p>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <button onClick={() => setCurrentTab('opportunities')} className="hover:underline">
              Official Scholarships
            </button>
            <button onClick={() => setCurrentTab('bookbridge')} className="hover:underline">
              BookBridge
            </button>
            <button onClick={() => setCurrentTab('settings')} className="hover:underline">
              Privacy & Safeguards
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          <OfflineProvider>
            <AppContent />
          </OfflineProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
