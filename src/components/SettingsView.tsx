import React, { useRef } from 'react';
import { AppSettings, Task, Category, Note, Habit, Goal, ActivityLog } from '../types';
import { 
  Palette, 
  Database, 
  Bell, 
  Keyboard, 
  FileDown, 
  FileUp, 
  Volume2, 
  Settings as SettingsIcon,
  Check,
  RotateCcw,
  User,
  Monitor
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  // Backup/Restore data hooks
  tasks: Task[];
  categories: Category[];
  notes: Note[];
  habits: Habit[];
  goals: Goal[];
  activityLogs: ActivityLog[];
  onImportBackup: (importedState: BackupData) => void;
  onClearDatabase: () => void;
  onInstallApp?: () => void;
}

type BackupData = Partial<{
  tasks: Task[];
  categories: Category[];
  notes: Note[];
  habits: Habit[];
  goals: Goal[];
  activityLogs: ActivityLog[];
  settings: AppSettings;
}>;

function isBackupData(value: unknown): value is BackupData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return Array.isArray(data.tasks) && Array.isArray(data.categories);
}

export default function SettingsView({
  settings,
  onUpdateSettings,
  tasks,
  categories,
  notes,
  habits,
  goals,
  activityLogs,
  onImportBackup,
  onClearDatabase,
  onInstallApp,
}: SettingsViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = [
    { name: 'Indigo (Default)', hex: '#6366f1', value: 'indigo' },
    { name: 'Linear Purple', hex: '#8b5cf6', value: 'violet' },
    { name: 'Emerald Forest', hex: '#10b981', value: 'emerald' },
    { name: 'Warm Amber', hex: '#f59e0b', value: 'amber' },
    { name: 'Rose Crimson', hex: '#f43f5e', value: 'rose' },
    { name: 'Ocean Breeze', hex: '#3b82f6', value: 'blue' }
  ];

  const handleBackupExport = () => {
    const dataToExport = {
      tasks,
      categories,
      notes,
      habits,
      goals,
      activityLogs,
      settings,
      exportTimestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ubuntu_productivity_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBackupImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData: unknown = JSON.parse(event.target?.result as string);
        if (isBackupData(importedData)) {
          onImportBackup(importedData);
          alert('Database restored successfully from local JSON backup!');
        } else {
          alert('Invalid backup structure. Required fields (tasks, categories) are missing.');
        }
      } catch (err) {
        alert('Failed to parse backup file. Please make sure it is a valid backup.json.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Settings Options Column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Card: User Profile & Branding */}
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-5 space-y-4 text-gray-900 dark:text-sophisticated-text animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-2">
            <User className="w-4 h-4 text-sophisticated-accent" /> Profile & Brand Customization
          </h3>
          <p className="text-[11px] text-gray-400 dark:text-sophisticated-muted leading-relaxed font-mono">
            Set your display identity and workspace suite title instantly.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-1.5 uppercase">Display Name</label>
              <input
                type="text"
                value={settings.userName || ''}
                onChange={(e) => onUpdateSettings({ ...settings, userName: e.target.value })}
                placeholder="Pranav"
                className="w-full text-xs font-medium px-3 py-2 bg-zinc-50 dark:bg-sophisticated-bg border border-gray-200 dark:border-sophisticated-border rounded-lg outline-none focus:border-sophisticated-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-1.5 uppercase">Workspace Suite Name</label>
              <input
                type="text"
                value={settings.suiteName || ''}
                onChange={(e) => onUpdateSettings({ ...settings, suiteName: e.target.value })}
                placeholder="Pranav Suite"
                className="w-full text-xs font-medium px-3 py-2 bg-zinc-50 dark:bg-sophisticated-bg border border-gray-200 dark:border-sophisticated-border rounded-lg outline-none focus:border-sophisticated-accent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Card: Desktop Application Integration */}
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-5 space-y-4 text-gray-900 dark:text-sophisticated-text animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-2">
            <Monitor className="w-4 h-4 text-sophisticated-accent" /> Desktop App (Notion Style)
          </h3>
          <p className="text-[11px] text-gray-400 dark:text-sophisticated-muted leading-relaxed font-mono">
            Install {settings.suiteName || 'Pranav Suite'} directly to your desktop or mobile home screen. It will launch in an isolated window with standard app shortcuts, high-performance offline startup, and zero browser tab clutter!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-50 dark:bg-sophisticated-bg border border-gray-150/50 dark:border-sophisticated-border/60 rounded-xl">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-gray-800 dark:text-sophisticated-text block">Launch Standalone Workspace</span>
              <span className="text-[10px] text-gray-400 dark:text-sophisticated-muted font-mono">Optimized for Windows, macOS, Linux, Android &amp; iOS</span>
            </div>
            <button
              onClick={onInstallApp}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#5E6AD2] hover:bg-[#4d59be] text-white text-xs font-bold rounded-lg shadow-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Install to Desktop / Dock</span>
            </button>
          </div>
        </div>

        {/* Card: Theme & Visual preferences */}
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-5 space-y-4 text-gray-900 dark:text-sophisticated-text">
          <h3 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-2">
            <Palette className="w-4 h-4 text-sophisticated-accent" /> Interface Customization
          </h3>
          
          {/* Theme selection */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-2 uppercase">Core Visual Skin</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  settings.theme === 'light' 
                    ? 'border-sophisticated-accent bg-indigo-50/10 text-indigo-600' 
                    : 'border-gray-100 dark:border-sophisticated-border text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>Clarity Light Theme</span>
                {settings.theme === 'light' && <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  settings.theme === 'dark' 
                    ? 'border-sophisticated-accent bg-sophisticated-active text-sophisticated-accent' 
                    : 'border-gray-100 dark:border-sophisticated-border text-zinc-300 hover:bg-sophisticated-active'
                }`}
              >
                <span>Aura Dark Theme</span>
                {settings.theme === 'dark' && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Accent Customization */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-2 uppercase">Brand Accent Color</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {colors.map(col => (
                <button
                  key={col.value}
                  onClick={() => onUpdateSettings({ ...settings, accentColor: col.hex })}
                  className={`p-2 rounded-lg border text-[11px] font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    settings.accentColor === col.hex 
                      ? 'border-sophisticated-accent bg-indigo-50/10 text-indigo-600 dark:text-sophisticated-accent font-semibold' 
                      : 'border-gray-100 dark:border-sophisticated-border text-gray-600 dark:text-sophisticated-muted hover:bg-gray-50 dark:hover:bg-sophisticated-active'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.hex }} />
                  <span>{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Sizes */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-2 uppercase">Text Density Scales</label>
            <div className="flex gap-2">
              {(['sm', 'md', 'lg'] as const).map(sz => (
                <button
                  key={sz}
                  onClick={() => onUpdateSettings({ ...settings, fontSize: sz })}
                  className={`px-4 py-1.5 rounded-lg border text-xs font-bold uppercase font-mono transition-all cursor-pointer ${
                    settings.fontSize === sz 
                      ? 'border-sophisticated-accent bg-indigo-50/10 text-indigo-600 dark:bg-sophisticated-active dark:text-sophisticated-accent' 
                      : 'border-gray-100 dark:border-sophisticated-border text-gray-500 hover:bg-gray-50 dark:hover:bg-sophisticated-active'
                  }`}
                >
                  {sz === 'sm' ? 'High Density' : sz === 'md' ? 'Balanced' : 'Accessible'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card: SQLite local transfers & backups */}
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-5 space-y-4 text-gray-900 dark:text-sophisticated-text">
          <h3 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" /> Database Local Transfer (JSON Backups)
          </h3>
          
          <p className="text-[11px] text-gray-400 dark:text-sophisticated-muted leading-relaxed">
            All database operations are committed locally. Use the options below to bundle and transfer your environment state.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleBackupExport}
              className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-sophisticated-bg dark:hover:bg-sophisticated-active text-gray-700 dark:text-sophisticated-text border border-gray-100 dark:border-sophisticated-border text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-sophisticated-accent" /> Export DB Backup
            </button>

            <button
              onClick={handleBackupImportClick}
              className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-sophisticated-bg dark:hover:bg-sophisticated-active text-gray-700 dark:text-sophisticated-text border border-gray-100 dark:border-sophisticated-border text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-sophisticated-accent" /> Restore DB Backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileImport}
            />
          </div>

          <div className="pt-3 border-t border-gray-50 dark:border-sophisticated-border flex justify-between items-center">
            <div>
              <h5 className="text-xs font-semibold text-gray-700 dark:text-sophisticated-text">Wipe Database cache</h5>
              <p className="text-[10px] text-gray-400 dark:text-sophisticated-muted">Permanently clears local SQLite memory.</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you absolutely sure you want to clear your local database cache? This action is irreversible.')) {
                  onClearDatabase();
                }
              }}
              className="px-2.5 py-1 text-[10px] font-bold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
            >
              Flush Database
            </button>
          </div>
        </div>

      </div>

      {/* Column: Shortcuts Info */}
      <div className="space-y-6">
        {/* Shortcuts Map panel */}
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-5 space-y-4 text-gray-900 dark:text-sophisticated-text">
          <h3 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-purple-500" /> Hotkey Configuration
          </h3>

          <p className="text-[10px] text-gray-400 dark:text-sophisticated-muted leading-relaxed font-mono">
            Fast keyboard command mappings to accelerate workflows.
          </p>

          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center text-xs p-2.5 bg-gray-50/50 dark:bg-sophisticated-bg rounded-lg">
              <span className="font-semibold text-gray-700 dark:text-sophisticated-text">Command Palette</span>
              <kbd className="px-2 py-0.5 rounded bg-white dark:bg-sophisticated-active border dark:border-sophisticated-border text-[10px] font-mono text-gray-400">Ctrl + P</kbd>
            </div>
            <div className="flex justify-between items-center text-xs p-2.5 bg-gray-50/50 dark:bg-sophisticated-bg rounded-lg">
              <span className="font-semibold text-gray-700 dark:text-sophisticated-text">New Task Overlay</span>
              <kbd className="px-2 py-0.5 rounded bg-white dark:bg-sophisticated-active border dark:border-sophisticated-border text-[10px] font-mono text-gray-400">Ctrl + N</kbd>
            </div>
            <div className="flex justify-between items-center text-xs p-2.5 bg-gray-50/50 dark:bg-sophisticated-bg rounded-lg">
              <span className="font-semibold text-gray-700 dark:text-sophisticated-text">Workspace Search</span>
              <kbd className="px-2 py-0.5 rounded bg-white dark:bg-sophisticated-active border dark:border-sophisticated-border text-[10px] font-mono text-gray-400">Ctrl + F</kbd>
            </div>
            <div className="flex justify-between items-center text-xs p-2.5 bg-gray-50/50 dark:bg-sophisticated-bg rounded-lg">
              <span className="font-semibold text-gray-700 dark:text-sophisticated-text">Toggle Dark Theme</span>
              <kbd className="px-2 py-0.5 rounded bg-white dark:bg-sophisticated-active border dark:border-sophisticated-border text-[10px] font-mono text-gray-400">Ctrl+Shift+D</kbd>
            </div>
          </div>
        </div>

        {/* Linux Notification System information card */}
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-5 space-y-3 shadow-xs text-gray-900 dark:text-sophisticated-text">
          <h4 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-amber-500" /> OS Notifications
          </h4>
          <p className="text-[11px] text-gray-400 dark:text-sophisticated-muted leading-relaxed font-mono">
            This app synchronizes reminders with the Ubuntu <code className="text-indigo-600 dark:text-sophisticated-accent font-bold">libnotify</code> daemon using standard DBus socket binds.
          </p>
          <div className="text-[10px] bg-gray-50 dark:bg-sophisticated-bg p-2.5 rounded border dark:border-sophisticated-border font-mono text-gray-400 space-y-1.5">
            <div>Ensure daemon is running:</div>
            <div className="text-sophisticated-accent bg-indigo-50/40 dark:bg-sophisticated-active/20 p-1.5 rounded text-[9px] truncate">
              sudo apt install libnotify-bin
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
