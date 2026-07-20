import React from 'react';
import { AppSettings } from '../types';
import { 
  Compass, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  FileText, 
  Play, 
  Flame, 
  BarChart, 
  Settings as SettingsIcon,
  Command,
  UserCheck,
  X,
  Download
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onOpenCommandPalette: () => void;
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
  onInstallApp: () => void;
}

export default function Sidebar({
  activeView,
  onViewChange,
  onOpenCommandPalette,
  settings,
  isOpen,
  onClose,
  onInstallApp,
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'tasks', label: 'Tasks Manager', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar Planner', icon: CalendarIcon },
    { id: 'notes', label: 'Notes & Docs', icon: FileText },
    { id: 'pomodoro', label: 'Pomodoro Timer', icon: Play },
    { id: 'habits', label: 'Habits & Goals', icon: Flame },
    { id: 'stats', label: 'Performance Stats', icon: BarChart },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside 
      id="sidebar-panel" 
      className={`fixed md:relative top-0 bottom-0 left-0 w-64 bg-white dark:bg-sophisticated-sidebar border-r border-gray-100 dark:border-sophisticated-border flex flex-col justify-between h-full shrink-0 z-40 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:hidden'
      }`}
    >
      
      {/* Brand & Section */}
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-sophisticated-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5E6AD2] to-[#9B6AD2] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#5E6AD2]/20">
              {(settings.userName || 'Pranav').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-sm font-display font-extrabold tracking-tight leading-none bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {settings.suiteName || 'Pranav Suite'}
              </h1>
              <span className="text-[9px] font-mono font-semibold text-gray-400 dark:text-sophisticated-muted tracking-wider">OFFLINE RUNTIME</span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-sophisticated-text hover:bg-gray-100 dark:hover:bg-sophisticated-active transition-colors cursor-pointer"
            title="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items list */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const customAccent = settings.accentColor === '#8b5cf6' ? '#5E6AD2' : settings.accentColor;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-tight transition-all text-left border ${
                  isActive 
                    ? 'bg-[#5E6AD2]/10 dark:bg-sophisticated-active text-[#5E6AD2] dark:text-white border-[#5E6AD2]/20 dark:border-sophisticated-border' 
                    : 'border-transparent text-gray-500 dark:text-sophisticated-muted hover:bg-gray-50/50 dark:hover:bg-sophisticated-active/50 hover:text-gray-800 dark:hover:text-sophisticated-text'
                }`}
                style={{ color: isActive ? customAccent : undefined }}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? '' : 'text-gray-400 dark:text-sophisticated-muted'}`} style={{ color: isActive ? customAccent : undefined }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile & Command palette trigger */}
      <div className="p-4 space-y-3 border-t border-gray-100 dark:border-sophisticated-border">
        
        {/* Command palette hint */}
        <button 
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-sophisticated-bg hover:bg-gray-100 dark:hover:bg-sophisticated-active border border-gray-100 dark:border-sophisticated-border rounded-lg text-[10px] text-gray-400 font-mono transition-colors"
        >
          <span className="flex items-center gap-1"><Command className="w-3 h-3 text-sophisticated-accent" /> Search Workspace</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-sophisticated-card border dark:border-sophisticated-border text-[9px] font-mono">Ctrl+P</kbd>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50/50 dark:bg-sophisticated-bg border border-gray-50 dark:border-sophisticated-border">
          <div className="w-7 h-7 rounded-full bg-[#5E6AD2]/10 dark:bg-sophisticated-active flex items-center justify-center text-[#5E6AD2]">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-gray-800 dark:text-sophisticated-text truncate leading-none">
              {settings.userName || 'Pranav'}
            </div>
            <span className="text-[8px] font-mono text-gray-400 dark:text-sophisticated-muted tracking-wider">SINGLE USER MODE</span>
          </div>
        </div>

        {/* Desktop App Installer Trigger (Notion style) */}
        <button
          onClick={onInstallApp}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/15 hover:to-purple-500/15 border border-indigo-500/20 dark:border-indigo-400/30 rounded-lg text-[10px] text-indigo-600 dark:text-indigo-400 font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02]"
          title="Install as Desktop App"
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span>Install Desktop App</span>
        </button>

      </div>

    </aside>
  );
}
