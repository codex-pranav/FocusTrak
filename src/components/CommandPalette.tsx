import React, { useState, useEffect, useRef } from 'react';
import { Search, Compass, Plus, Moon, Sun, Play, Settings as SettingsIcon, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onAddTask: () => void;
  onToggleTheme: () => void;
  onStartPomodoro: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onAddTask,
  onToggleTheme,
  onStartPomodoro,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands = [
    { id: 'new_task', label: 'Create New Task', icon: Plus, action: onAddTask, category: 'Quick Actions' },
    { id: 'nav_dash', label: 'Go to Dashboard', icon: Compass, action: () => onNavigate('dashboard'), category: 'Navigation' },
    { id: 'nav_tasks', label: 'Go to Tasks Manager', icon: Compass, action: () => onNavigate('tasks'), category: 'Navigation' },
    { id: 'nav_calendar', label: 'Go to Calendar', icon: Compass, action: () => onNavigate('calendar'), category: 'Navigation' },
    { id: 'nav_notes', label: 'Go to Notes & Docs', icon: Compass, action: () => onNavigate('notes'), category: 'Navigation' },
    { id: 'nav_habits', label: 'Go to Habits & Goals Tracker', icon: Compass, action: () => onNavigate('habits'), category: 'Navigation' },
    { id: 'nav_stats', label: 'Go to Performance Statistics', icon: Compass, action: () => onNavigate('stats'), category: 'Navigation' },
    { id: 'nav_settings', label: 'Go to Application Settings', icon: SettingsIcon, action: () => onNavigate('settings'), category: 'Navigation' },
    { id: 'start_pomo', label: 'Start Pomodoro Focus Timer', icon: Play, action: onStartPomodoro, category: 'Productivity' },
    { id: 'toggle_dark', label: 'Toggle Light/Dark Theme', icon: Moon, action: onToggleTheme, category: 'Appearance' },
  ];

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-xs">
      <div 
        id="command-palette-container"
        className="w-full max-w-xl bg-white dark:bg-sophisticated-sidebar border border-gray-200 dark:border-sophisticated-border rounded-xl shadow-2xl overflow-hidden transform transition-all duration-200 animate-in fade-in zoom-in-95 text-gray-900 dark:text-sophisticated-text"
      >
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100 dark:border-sophisticated-border">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm text-gray-900 dark:text-sophisticated-text outline-none placeholder-gray-400 dark:placeholder-sophisticated-muted"
            placeholder="Type a command or search workspace..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-sophisticated-text hover:bg-gray-100 dark:hover:bg-sophisticated-active transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[350px] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-sophisticated-muted">
              No matching commands or navigation routes found.
            </div>
          ) : (
            <div>
              {/* Group commands by category */}
              {Array.from(new Set(filtered.map(c => c.category))).map(category => (
                <div key={category}>
                  <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-400 dark:text-sophisticated-muted uppercase tracking-wider font-mono">
                    {category}
                  </div>
                  {filtered
                    .filter(c => c.category === category)
                    .map((cmd) => {
                      const absoluteIndex = filtered.indexOf(cmd);
                      const isSelected = absoluteIndex === selectedIndex;
                      const Icon = cmd.icon;

                      return (
                        <div
                          key={cmd.id}
                          className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-zinc-100 dark:bg-sophisticated-active text-gray-950 dark:text-white font-medium'
                              : 'text-gray-600 dark:text-sophisticated-muted hover:bg-gray-50 dark:hover:bg-sophisticated-bg/50'
                          }`}
                          onClick={() => {
                            cmd.action();
                            onClose();
                          }}
                        >
                          <div className="flex items-center space-x-3 text-xs">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-sophisticated-accent' : 'text-gray-400'}`} />
                            <span>{cmd.label}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-gray-200 dark:bg-sophisticated-bg text-gray-500 dark:text-sophisticated-muted border border-gray-100 dark:border-sophisticated-border">
                              Enter
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-sophisticated-bg border-t border-gray-100 dark:border-sophisticated-border text-[10px] text-gray-400 dark:text-sophisticated-muted font-mono">
          <span>Use ↑↓ to navigate, [Enter] to select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
