import React, { useState } from 'react';
import { Task, Category, Priority, Status, ActivityLog, AppSettings } from '../types';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Flame, 
  TrendingUp, 
  Plus, 
  Sparkles, 
  ChevronRight, 
  Activity, 
  Pin, 
  Calendar as CalendarIcon 
} from 'lucide-react';

interface DashboardViewProps {
  tasks: Task[];
  categories: Category[];
  activityLogs: ActivityLog[];
  streak: number;
  onAddTask: (task: Omit<Task, 'id' | 'createdDate'>) => void;
  onSelectTask: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export default function DashboardView({
  tasks,
  categories,
  activityLogs,
  streak,
  onAddTask,
  onSelectTask,
  onToggleComplete,
  settings,
  onUpdateSettings,
}: DashboardViewProps) {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState(categories[0]?.name || 'Personal');
  const [quickPriority, setQuickPriority] = useState<Priority>(Priority.MEDIUM);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(settings.userName || '');

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateSettings({
        ...settings,
        userName: tempName.trim()
      });
    }
    setIsEditingName(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const todayTasks = tasks.filter(t => t.dueDate === todayStr && !t.recentlyDeleted && t.status !== Status.ARCHIVED);
  const pendingToday = todayTasks.filter(t => t.status !== Status.COMPLETED && t.status !== Status.CANCELLED);
  const completedToday = todayTasks.filter(t => t.status === Status.COMPLETED);

  const overdueTasks = tasks.filter(t => {
    if (t.recentlyDeleted || t.status === Status.COMPLETED || t.status === Status.CANCELLED || t.status === Status.ARCHIVED) return false;
    if (!t.dueDate) return false;
    return t.dueDate < todayStr;
  });

  const upcomingTasks = tasks.filter(t => {
    if (t.recentlyDeleted || t.status === Status.COMPLETED || t.status === Status.CANCELLED || t.status === Status.ARCHIVED) return false;
    if (!t.dueDate) return false;
    return t.dueDate > todayStr;
  });

  const pinnedTasks = tasks.filter(t => t.pinned && !t.recentlyDeleted && t.status !== Status.COMPLETED);

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    // Smart parsing helper
    let parsedTitle = quickTitle;
    let parsedPriority = quickPriority;
    let parsedCategory = quickCategory;

    // Check for Priority tags inside text: !critical, !high, !medium, !low
    if (parsedTitle.toLowerCase().includes('!critical')) {
      parsedPriority = Priority.CRITICAL;
      parsedTitle = parsedTitle.replace(/!critical/gi, '');
    } else if (parsedTitle.toLowerCase().includes('!high')) {
      parsedPriority = Priority.HIGH;
      parsedTitle = parsedTitle.replace(/!high/gi, '');
    } else if (parsedTitle.toLowerCase().includes('!medium')) {
      parsedPriority = Priority.MEDIUM;
      parsedTitle = parsedTitle.replace(/!medium/gi, '');
    } else if (parsedTitle.toLowerCase().includes('!low')) {
      parsedPriority = Priority.LOW;
      parsedTitle = parsedTitle.replace(/!low/gi, '');
    }

    // Check for Category tag like #Coding, #Health
    categories.forEach(cat => {
      const tag = `#${cat.name.toLowerCase()}`;
      if (parsedTitle.toLowerCase().includes(tag)) {
        parsedCategory = cat.name;
        const reg = new RegExp(tag, 'gi');
        parsedTitle = parsedTitle.replace(reg, '');
      }
    });

    onAddTask({
      title: parsedTitle.trim(),
      description: 'Quickly added via main dashboard dashboard command.',
      category: parsedCategory,
      priority: parsedPriority,
      status: Status.PENDING,
      dueDate: todayStr,
      dueTime: '12:00',
      estimatedDuration: 25,
      actualDuration: 0,
      reminder: '15min',
      repeat: 'none',
      notes: '',
      tags: [],
      attachments: [],
      color: categories.find(c => c.name === parsedCategory)?.color || '#6366f1',
      pinned: false,
      favorite: false,
    });

    setQuickTitle('');
  };

  // Get productivity index
  const weeklyCompletionRate = (() => {
    const past7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    const relevantTasks = tasks.filter(t => past7Days.includes(t.dueDate) && !t.recentlyDeleted);
    if (relevantTasks.length === 0) return 100;
    const completed = relevantTasks.filter(t => t.status === Status.COMPLETED);
    return Math.round((completed.length / relevantTasks.length) * 100);
  })();

  return (
    <div id="dashboard-container" className="space-y-6 animate-in fade-in duration-300 text-gray-900 dark:text-sophisticated-text">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-zinc-50 to-zinc-100/50 dark:from-sophisticated-sidebar dark:to-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-2xl">
        <div>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-display font-bold text-gray-900 dark:text-sophisticated-text tracking-tight">
                Welcome back,
              </span>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveName();
                }}
                className="inline-flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={e => {
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                  className="text-xl font-display font-bold text-sophisticated-accent bg-transparent border-b-2 border-sophisticated-accent outline-none px-1 w-36"
                  autoFocus
                />
              </form>
            </div>
          ) : (
            <h1 className="text-xl font-display font-bold text-gray-900 dark:text-sophisticated-text tracking-tight flex items-center gap-2">
              Welcome back,{' '}
              <span 
                onClick={() => {
                  setTempName(settings.userName || '');
                  setIsEditingName(true);
                }}
                className="text-sophisticated-accent cursor-pointer hover:underline decoration-dashed decoration-2 underline-offset-4 flex items-center gap-1.5 group transition-all"
                title="Click to edit name"
              >
                {settings.userName || 'there'}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-zinc-200 dark:bg-sophisticated-active px-1.5 py-0.5 rounded font-mono text-zinc-500 dark:text-sophisticated-muted cursor-pointer font-bold">
                  Edit
                </span>
              </span>{' '}
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </h1>
          )}
          <p className="text-xs text-gray-500 dark:text-sophisticated-muted mt-1">
            Your workspace is clean. You have {pendingToday.length} pending tasks for today and {overdueTasks.length} overdue tasks waiting.
          </p>
        </div>
        
        {/* Quick Streak Indicator */}
        <div className="flex items-center gap-3 bg-white dark:bg-sophisticated-card px-4 py-2 border border-gray-100 dark:border-sophisticated-border rounded-xl shadow-xs">
          <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
          <div>
            <div className="text-xs text-gray-400 dark:text-sophisticated-muted font-mono">STREAK</div>
            <div className="text-sm font-bold text-gray-900 dark:text-sophisticated-text">{streak} Days Consistent</div>
          </div>
        </div>
      </div>

      {/* Grid of Key Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats 1 */}
        <div className="p-4 bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-sophisticated-muted">Completed Today</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-sophisticated-text mt-1 font-display">{completedToday.length}</h2>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[10px] text-gray-400 dark:text-sophisticated-muted mt-3 flex items-center gap-1 font-mono">
            <span>Progress Today:</span>
            <span className="font-semibold text-emerald-600">{todayTasks.length ? Math.round((completedToday.length / todayTasks.length) * 100) : 0}%</span>
          </div>
        </div>

        {/* Stats 2 */}
        <div className="p-4 bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-sophisticated-muted">Overdue Tasks</span>
              <h2 className={`text-2xl font-bold font-display mt-1 ${overdueTasks.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-sophisticated-text'}`}>{overdueTasks.length}</h2>
            </div>
            <div className={`p-2 rounded-lg ${overdueTasks.length > 0 ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' : 'bg-gray-50 dark:bg-sophisticated-active text-gray-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[10px] text-gray-400 dark:text-sophisticated-muted mt-3 font-mono">
            Requires immediate attention
          </div>
        </div>

        {/* Stats 3 */}
        <div className="p-4 bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-sophisticated-muted">Weekly Score</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-sophisticated-text mt-1 font-display">{weeklyCompletionRate}%</h2>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-sophisticated-active text-sophisticated-accent rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[10px] text-gray-400 dark:text-sophisticated-muted mt-3 font-mono">
            Rolling 7-day completion rate
          </div>
        </div>

        {/* Stats 4 */}
        <div className="p-4 bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-sophisticated-muted">Pinned Priorities</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-sophisticated-text mt-1 font-display">{pinnedTasks.length}</h2>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-600 dark:text-amber-400">
              <Pin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[10px] text-gray-400 dark:text-sophisticated-muted mt-3 font-mono">
            Anchored to focus zone
          </div>
        </div>
      </div>

      {/* Quick Add Task Parser Bar */}
      <form onSubmit={handleQuickAddSubmit} className="flex gap-2 p-1.5 bg-white dark:bg-sophisticated-sidebar border border-gray-200 dark:border-sophisticated-border rounded-xl shadow-xs">
        <input
          type="text"
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-gray-800 dark:text-sophisticated-text placeholder-gray-400 dark:placeholder-sophisticated-muted outline-none"
          placeholder="Quick Add Task... e.g. Finish chemistry assignment !High #College"
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
        />
        <div className="flex items-center gap-1.5 px-2">
          <select
            value={quickCategory}
            onChange={e => setQuickCategory(e.target.value)}
            className="bg-zinc-50 dark:bg-sophisticated-bg text-[10px] font-medium text-gray-600 dark:text-sophisticated-text border border-gray-100 dark:border-sophisticated-border rounded px-2 py-1 outline-none cursor-pointer"
          >
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <select
            value={quickPriority}
            onChange={e => setQuickPriority(e.target.value as Priority)}
            className="bg-zinc-50 dark:bg-sophisticated-bg text-[10px] font-medium text-gray-600 dark:text-sophisticated-text border border-gray-100 dark:border-sophisticated-border rounded px-2 py-1 outline-none cursor-pointer"
          >
            {Object.values(Priority).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-sophisticated-accent dark:hover:bg-sophisticated-accent-hover text-white rounded-lg flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Agenda Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-2">
              <CalendarIcon className="w-3.5 h-3.5 text-sophisticated-accent" /> Today's Agenda
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-sophisticated-active text-gray-500 dark:text-sophisticated-muted border dark:border-sophisticated-border">
              {todayStr}
            </span>
          </div>

          <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl divide-y divide-gray-100 dark:divide-sophisticated-border overflow-hidden">
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 dark:text-sophisticated-muted">
                No tasks scheduled for today. Fill your schedule using the Quick Add or Tasks panel!
              </div>
            ) : (
              todayTasks.map(task => (
                <div key={task.id} className="p-3.5 flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-sophisticated-active/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === Status.COMPLETED}
                      onChange={() => onToggleComplete(task)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-sophisticated-border text-sophisticated-accent focus:ring-sophisticated-accent cursor-pointer"
                    />
                    <div onClick={() => onSelectTask(task)} className="cursor-pointer">
                      <div className={`text-xs font-medium ${task.status === Status.COMPLETED ? 'line-through text-gray-400 dark:text-sophisticated-muted' : 'text-gray-800 dark:text-sophisticated-text'}`}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] px-1.5 py-0.2 rounded-sm font-mono uppercase tracking-wider text-white" style={{ backgroundColor: task.color || '#6366f1' }}>
                          {task.category}
                        </span>
                        <span className="text-[9px] text-gray-400 dark:text-sophisticated-muted font-mono">
                          {task.dueTime} • est. {task.estimatedDuration}m
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                      task.priority === Priority.CRITICAL ? 'bg-rose-50/10 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400 border dark:border-rose-500/20' :
                      task.priority === Priority.HIGH ? 'bg-amber-50/10 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400 border dark:border-amber-500/20' :
                      task.priority === Priority.MEDIUM ? 'bg-blue-50/10 text-[#5E6AD2] dark:bg-[#5E6AD2]/10 dark:text-[#5E6AD2] border dark:border-[#5E6AD2]/20' :
                      'bg-gray-50/10 text-gray-500 dark:bg-sophisticated-active dark:text-sophisticated-muted border dark:border-sophisticated-border'
                    }`}>
                      {task.priority}
                    </span>
                    <button 
                      onClick={() => onSelectTask(task)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:bg-gray-100 dark:hover:bg-sophisticated-active hover:text-gray-600 dark:hover:text-sophisticated-text transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Upcoming Block */}
          {upcomingTasks.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-[10px] font-bold text-gray-400 dark:text-sophisticated-muted uppercase tracking-wider font-mono">Upcoming Horizon</h4>
              <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl divide-y divide-gray-100 dark:divide-sophisticated-border">
                {upcomingTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="p-3 flex items-center justify-between hover:bg-gray-50/30 dark:hover:bg-sophisticated-active/40 cursor-pointer" onClick={() => onSelectTask(task)}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.color || '#cbd5e1' }} />
                      <span className="text-xs text-gray-700 dark:text-sophisticated-text font-medium truncate max-w-[200px]">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-gray-400 dark:text-sophisticated-muted font-mono">{task.dueDate}</span>
                      <span className="text-[9px] bg-zinc-100 dark:bg-sophisticated-active px-1.5 py-0.5 rounded text-gray-500 dark:text-sophisticated-muted">{task.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar logs / feed */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-500" /> Recent Activity Log
          </h3>

          <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-4 space-y-4 max-h-[380px] overflow-y-auto">
            {activityLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 dark:text-sophisticated-muted">
                No activity logged yet.
              </div>
            ) : (
              <div className="relative border-l border-gray-100 dark:border-sophisticated-border ml-1.5 pl-3.5 space-y-4">
                {activityLogs.map(log => (
                  <div key={log.id} className="relative text-xs">
                    <div className="absolute -left-[19.5px] top-1 w-2.5 h-2.5 rounded-full border border-white dark:border-sophisticated-bg bg-sophisticated-accent shadow-xs" />
                    <div className="flex justify-between text-[10px] text-gray-400 dark:text-sophisticated-muted font-mono mb-0.5">
                      <span>{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-gray-700 dark:text-sophisticated-text text-[11px] leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
