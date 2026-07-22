import { useState } from 'react';
import {
  CalendarDays,
  CheckSquare,
  ChevronUp,
  Compass,
  FilePlus2,
  Menu,
  Plus,
  Search,
  Settings,
  Timer,
} from 'lucide-react';

interface MobileNavigationProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenMenu: () => void;
  onSearch: () => void;
  onCreateTask: () => void;
  isTaskModalOpen: boolean;
}

const tabs = [
  { id: 'dashboard', label: 'Home', icon: Compass },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'pomodoro', label: 'Focus', icon: Timer },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function MobileNavigation({
  activeView,
  onNavigate,
  onOpenMenu,
  onSearch,
  onCreateTask,
  isTaskModalOpen,
}: MobileNavigationProps) {
  const [isFabOpen, setIsFabOpen] = useState(false);

  const navigate = (view: string) => {
    setIsFabOpen(false);
    onNavigate(view);
  };

  return (
    <>
      <header className="mobile-only mobile-topbar">
        <button className="mobile-icon-button" onClick={onOpenMenu} aria-label="Open navigation">
          <Menu aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="mobile-topbar-title">{tabs.find((tab) => tab.id === activeView)?.label ?? 'FocusTrak'}</p>
          <p className="mobile-topbar-subtitle">FocusTrak</p>
        </div>
        <button className="mobile-icon-button" onClick={onSearch} aria-label="Search workspace">
          <Search aria-hidden="true" />
        </button>
        <button className="mobile-icon-button" onClick={() => navigate('settings')} aria-label="Open settings">
          <Settings aria-hidden="true" />
        </button>
      </header>

      {isFabOpen && !isTaskModalOpen && (
        <div className="mobile-fab-actions" role="menu" aria-label="Create new item">
          <button onClick={() => { setIsFabOpen(false); onCreateTask(); }} role="menuitem">
            <span>New task</span><CheckSquare aria-hidden="true" />
          </button>
          <button onClick={() => navigate('notes')} role="menuitem">
            <span>Quick note</span><FilePlus2 aria-hidden="true" />
          </button>
          <button onClick={() => navigate('calendar')} role="menuitem">
            <span>Reminder</span><CalendarDays aria-hidden="true" />
          </button>
        </div>
      )}

      {!isTaskModalOpen && (
        <button
          className={`mobile-fab ${isFabOpen ? 'mobile-fab-open' : ''}`}
          onClick={() => setIsFabOpen((open) => !open)}
          aria-label={isFabOpen ? 'Close create menu' : 'Create new item'}
          aria-expanded={isFabOpen}
        >
          {isFabOpen ? <ChevronUp aria-hidden="true" /> : <Plus aria-hidden="true" />}
        </button>
      )}

      <nav className="mobile-bottom-nav" aria-label="Primary navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = activeView === tab.id;
          return (
            <button
              key={tab.id}
              className={selected ? 'mobile-nav-active' : ''}
              onClick={() => navigate(tab.id)}
              aria-current={selected ? 'page' : undefined}
            >
              <Icon aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
