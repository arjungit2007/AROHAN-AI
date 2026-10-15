import React from 'react';
import { Compass, Sparkles, MapPin, Award, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenMore: () => void;
  isMoreOpen: boolean;
  moreButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, setCurrentTab, onOpenMore, isMoreOpen, moreButtonRef }) => {
  const { t } = useLanguage();

  const tabs = [
    { id: 'landing', label: t('navHome'), icon: Compass },
    { id: 'explore', label: 'Explore', icon: Sparkles },
    { id: 'roadmap', label: 'Roadmap', icon: MapPin },
    { id: 'opportunities', label: 'Schemes', icon: Award },
  ];

  return (
    <nav aria-label="Primary navigation" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* More Menu Pill */}
        <button
          ref={moreButtonRef}
          onClick={onOpenMore}
          aria-label="Open more navigation options"
          aria-expanded={isMoreOpen}
          aria-controls="more-navigation-drawer"
          className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 ${
            ['bookbridge', 'mentors', 'teacher', 'dashboard', 'settings'].includes(currentTab)
              ? 'text-purple-600 font-bold'
              : ''
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
};
