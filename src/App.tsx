import React, { useState, useEffect } from 'react';

import {
  addTask,
  getAllTasks,
  updateTask as updateTaskDB,
  deleteTask as deleteTaskDB,
  restoreTask as restoreTaskDB,
  duplicateTask as duplicateTaskDB,
  replaceAllTasks,
} from "./database/taskrepo";
import {
  Task,
  Category,
  Note,
  Habit,
  Goal,
  ActivityLog,
  AppSettings,
  Priority,
  Status
} from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TasksView from './components/TasksView';
import CalendarView from './components/CalendarView';
import NotesView from './components/NotesView';
import PomodoroTimer from './components/PomodoroTimer';
import HabitsGoalsView from './components/HabitsGoalsView';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import CommandPalette from './components/CommandPalette';
import MobileNavigation from './components/MobileNavigation';

import { Bell, Menu } from 'lucide-react';

// Default Categories as requested
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'College', color: '#6366f1', icon: 'GraduationCap' },
  { id: '2', name: 'Coding', color: '#10b981', icon: 'Code' },
  { id: '3', name: 'Projects', color: '#8b5cf6', icon: 'FolderGit' },
  { id: '4', name: 'Health', color: '#f43f5e', icon: 'Activity' },
  { id: '5', name: 'Finance', color: '#f59e0b', icon: 'DollarSign' },
  { id: '6', name: 'Shopping', color: '#ec4899', icon: 'ShoppingBag' },
  { id: '7', name: 'Personal', color: '#06b6d4', icon: 'User' },
  { id: '8', name: 'Learning', color: '#14b8a6', icon: 'BookOpen' },
  { id: '9', name: 'SIH', color: '#f97316', icon: 'Flag' }
];

// High Fidelity Initial Tasks to populate the productivity timeline beautifully
const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Design database schema for SIH project',
    description: 'Structure SQLAlchemy models for task history, categories, and settings.',
    category: 'SIH',
    priority: Priority.CRITICAL,
    status: Status.IN_PROGRESS,
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '10:00',
    createdDate: new Date().toISOString(),
    estimatedDuration: 45,
    actualDuration: 0,
    reminder: '15min',
    repeat: 'none',
    notes: 'Include tables for task links and tags.',
    tags: ['sih', 'db-design'],
    attachments: [],
    color: '#f97316',
    pinned: true,
    favorite: true
  },
  {
    id: 't2',
    title: 'Code PySide6 main sidebar widget UI templates',
    description: 'Implement modern borderless layouts with hover micro-animations.',
    category: 'Coding',
    priority: Priority.HIGH,
    status: Status.PENDING,
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '15:30',
    createdDate: new Date().toISOString(),
    estimatedDuration: 60,
    actualDuration: 0,
    reminder: '30min',
    repeat: 'none',
    notes: 'Reference Linear and Notion aesthetics.',
    tags: ['qt', 'pyside6', 'ui-sprint'],
    attachments: [],
    color: '#10b981',
    pinned: true,
    favorite: false,
    dependencies: ['t1'] // t2 depends on t1 schema completion!
  },
  {
    id: 't3',
    title: 'Submit college seminar report',
    description: 'Proofread and sign final drafts before submission.',
    category: 'College',
    priority: Priority.MEDIUM,
    status: Status.PENDING,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    dueTime: '12:00',
    createdDate: new Date().toISOString(),
    estimatedDuration: 30,
    actualDuration: 0,
    reminder: '1day',
    repeat: 'none',
    notes: 'Draft in college docs directory.',
    tags: ['college', 'seminar'],
    attachments: [],
    color: '#6366f1',
    pinned: false,
    favorite: false
  }
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'n1',
    title: 'SIH Workspace Architecture',
    content: '# Smart India Hackathon Workspace\n\nThis workspace aggregates SIH productivity logs, coding tasks, and project boards.\n\n## Technical Architecture:\n* GUI Framework: PySide6 (Qt for Python)\n* Local Store: SQLite with SQLAlchemy ORM\n* Packaging: PyInstaller to standalone binary\n\n## Action Plan:\n1. Build models.py representing tasks, notes, sessions.\n2. Draft app.py containing the PySide6 layout components.\n3. Integrate local notify-send subprocesses for reminders.',
    isChecklist: false,
    checklistItems: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_HABITS: Habit[] = [
  {
    id: 'h1',
    name: '30 Minutes Coding Sprint',
    frequency: 'daily',
    streak: 5,
    history: {
      [new Date().toISOString().split('T')[0]]: true,
      [new Date(Date.now() - 86400000).toISOString().split('T')[0]]: true
    },
    color: '#10b981'
  }
];

const INITIAL_GOALS: Goal[] = [
  {
    id: 'g1',
    name: 'Complete SIH Code Prototype',
    target: 10,
    current: 4,
    deadline: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    category: 'SIH',
    color: '#f97316'
  }
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'l1',
    action: 'Workspace Setup',
    timestamp: new Date().toISOString(),
    details: 'Workspace initialized successfully.'
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: '#5E6AD2', // Sophisticated Dark Slate
  fontSize: 'md',
  notificationsEnabled: true,
  shortcutsEnabled: true,
  autoBackup: true,
  userName: undefined,
  suiteName: 'FocusTrak'
};

export default function App() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });

  const [taskCreationRequest, setTaskCreationRequest] = useState(0);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Core App states loaded from LocalStorage
  const readSaved = <T,>(key: string, fallback: T): T => {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) as T : fallback;
    } catch {
      return fallback;
    }
  };

  const [settings, setSettings] = useState<AppSettings>(() => readSaved('ubuntu_settings', DEFAULT_SETTINGS));
  const [profileName, setProfileName] = useState('');
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(
    () => !readSaved('ubuntu_settings', DEFAULT_SETTINGS).userName?.trim()
  );

  const [tasks, setTasks] = useState<Task[]>([]);

  async function loadTasks() {
    try {
      const dbTasks = await getAllTasks();
      setTasks(dbTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setTasks(INITIAL_TASKS);
    }
  }

  const [categories, setCategories] = useState<Category[]>(() => {
    return readSaved('ubuntu_categories', DEFAULT_CATEGORIES);
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    return readSaved('ubuntu_notes', INITIAL_NOTES);
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    return readSaved('ubuntu_habits', INITIAL_HABITS);
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    return readSaved('ubuntu_goals', INITIAL_GOALS);
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    return readSaved('ubuntu_logs', INITIAL_LOGS);
  });

  const [streak, setStreak] = useState(5);

  // Sync to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('ubuntu_settings', JSON.stringify(settings));
    // Apply theme class to document
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    localStorage.setItem('ubuntu_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('ubuntu_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('ubuntu_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('ubuntu_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('ubuntu_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Logging utility helper
  const logActivity = (action: string, details: string) => {
    const log: ActivityLog = {
      id: String(Date.now()),
      action,
      timestamp: new Date().toISOString(),
      details
    };
    setActivityLogs(prev => [log, ...prev].slice(0, 50)); // limit to 50 logs
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if (!settings.shortcutsEnabled) return;

      // Ctrl + P: Command Palette
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }

      // Ctrl + N: Quick navigate and focus tasks tab
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setActiveView('tasks');
        logActivity('Shortcut Trigger', 'Navigated to Tasks workspace.');
      }

      // Ctrl + Shift + D: Dark theme toggle
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setSettings(prev => ({
          ...prev,
          theme: prev.theme === 'dark' ? 'light' : 'dark'
        }));
        logActivity('Theme Toggle', 'Switched visual workspace color mode.');
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [settings]);

  // Task operation callbacks
  const handleAddTask = async (taskInput: Omit<Task, 'id' | 'createdDate'>) => {
    const newTask: Task = {
      ...taskInput,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
      createdDate: new Date().toISOString()
    };
    try {
      await addTask(newTask);
      await loadTasks();
      logActivity("Task Created", `Added task: "${newTask.title}" under ${newTask.category}.`);
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  };

  const handleUpdateTask = async (updated: Task) => {
  try {
    await updateTaskDB(updated);
    await loadTasks();
    logActivity("Task Updated", `Modified task: "${updated.title}".`);
    } catch (error) {
    console.error('Failed to update task:', error);
    throw error;
  }
};

  const handleDeleteTask = async (taskId: string) => {
  const task = tasks.find(t => t.id === taskId);

  try {
    await deleteTaskDB(taskId);
    await loadTasks();
    logActivity("Task Deleted", `Deleted task: "${task?.title ?? ""}".`);
  } catch (error) {
    console.error('Failed to delete task:', error);
  }
};

  const handleRestoreTask = async (taskId: string) => {
  const task = tasks.find(t => t.id === taskId);

  try {
    await restoreTaskDB(taskId);
    await loadTasks();
    logActivity("Task Restored", `Restored task: "${task?.title ?? ""}".`);
  } catch (error) {
    console.error('Failed to restore task:', error);
  }
};

 const handleDuplicateTask = async (task: Task) => {
  try {
    await duplicateTaskDB(task);
    await loadTasks();
    logActivity("Task Duplicated", `Duplicated task: "${task.title}".`);
  } catch (error) {
    console.error('Failed to duplicate task:', error);
  }
};

  // Category operations
  const handleAddCategory = (cat: Omit<Category, 'id'>) => {
    const newCat = { ...cat, id: `cat-${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
    logActivity('Category Added', `Added Category group: "${cat.name}".`);
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
    logActivity('Category Removed', 'Deleted custom category group mapping.');
  };

  // Note operations
  const handleAddNote = (noteInput: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteInput,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveView('notes');
    logActivity('Document Added', `Drafted new note: "${newNote.title}".`);
  };

  const handleUpdateNote = (updated: Note) => {
    setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    logActivity('Document Removed', 'Purged note draft from active documents list.');
  };

  // Habits operations
  const handleAddHabit = (habitInput: Omit<Habit, 'id' | 'streak' | 'history'>) => {
    const newHabit: Habit = {
      ...habitInput,
      id: `habit-${Date.now()}`,
      streak: 0,
      history: {}
    };
    setHabits(prev => [...prev, newHabit]);
    logActivity('Habit Tracked', `Added daily habit goal: "${newHabit.name}".`);
  };

  const handleToggleHabitDate = (habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const isCompleted = h.history?.[dateStr] || false;
      const updatedHistory = { ...h.history, [dateStr]: !isCompleted };

      // Basic dynamic streak calculator
      let calculatedStreak = h.streak;
      if (!isCompleted) calculatedStreak += 1;
      else calculatedStreak = Math.max(0, calculatedStreak - 1);

      return {
        ...h,
        history: updatedHistory,
        streak: calculatedStreak
      };
    }));
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    logActivity('Habit Terminated', 'Deleted habit schedule tracking logs.');
  };

  // Goals operations
  const handleAddGoal = (goalInput: Omit<Goal, 'id'>) => {
    const newGoal: Goal = { ...goalInput, id: `goal-${Date.now()}` };
    setGoals(prev => [...prev, newGoal]);
    logActivity('Goal Initialized', `Added milestone goal: "${newGoal.name}".`);
  };

  const handleUpdateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current: progress } : g));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    logActivity('Goal Terminated', 'Deleted milestone goal entry.');
  };

  // Settings: Database transfers / reset
  const handleImportBackup = (state: Partial<{
    tasks: Task[];
    categories: Category[];
    notes: Note[];
    habits: Habit[];
    goals: Goal[];
    activityLogs: ActivityLog[];
    settings: AppSettings;
  }>) => {
    if (Array.isArray(state.tasks)) {
      setTasks(state.tasks);
      void replaceAllTasks(state.tasks);
    }
    if (state.categories) setCategories(state.categories);
    if (state.notes) setNotes(state.notes);
    if (state.habits) setHabits(state.habits);
    if (state.goals) setGoals(state.goals);
    if (state.activityLogs) setActivityLogs(state.activityLogs);
    if (state.settings) setSettings(state.settings);
    logActivity('Database Restored', 'Restored complete database state from JSON.');
  };

  const handleClearDatabase = () => {
    setTasks([]);
    void replaceAllTasks([]);
    setCategories(DEFAULT_CATEGORIES);
    setNotes([]);
    setHabits([]);
    setGoals([]);
    setActivityLogs(INITIAL_LOGS);
    setStreak(0);
    logActivity('Database Flushed', 'Wiped database memory and reset defaults.');
  };

  return (
    <div className="flex h-[100dvh] md:h-screen bg-[#f3f4f6] dark:bg-sophisticated-bg transition-colors duration-250 font-sans overflow-hidden select-none text-gray-900 dark:text-sophisticated-text">

      {/* Sidebar navigation controls */}
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
          }
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        settings={settings}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden transition-opacity"
        />
      )}

      {/* Main Workspace Frame container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        <MobileNavigation
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
          onOpenMenu={() => setIsSidebarOpen(true)}
          onSearch={() => setIsCommandPaletteOpen(true)}
          onCreateTask={() => {
            setActiveView('tasks');
            setTaskCreationRequest((request) => request + 1);
          }}
          isTaskModalOpen={isTaskModalOpen}
        />

        {/* Workspace Top Header Bar */}
        <header className="hidden md:flex h-14 px-6 border-b border-gray-100 dark:border-sophisticated-border bg-white/80 dark:bg-sophisticated-sidebar/80 backdrop-blur-md items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-sophisticated-active text-gray-500 dark:text-sophisticated-text transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Reminder Status block */}
            <span className="text-[10px] bg-indigo-50 dark:bg-sophisticated-active text-[#5E6AD2] dark:text-[#5E6AD2] font-bold font-mono px-2.5 py-1 rounded-full border dark:border-sophisticated-border flex items-center gap-1">
              <Bell className="w-3 h-3" /> System Reminders: Libnotify Binds Active
            </span>
          </div>
        </header>

        {/* Dynamic Workspace Workspace */}
        <div className="mobile-workspace flex-1 overflow-y-auto p-4 md:p-8 space-y-6">

          {activeView === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              categories={categories}
              activityLogs={activityLogs}
              streak={streak}
              onAddTask={handleAddTask}
              onSelectTask={(task) => {
                setActiveView('tasks');
              }}
              onToggleComplete={(task) => {
                handleUpdateTask({
                  ...task,
                  status: task.status === Status.COMPLETED ? Status.PENDING : Status.COMPLETED,
                  completedDate: task.status !== Status.COMPLETED ? new Date().toISOString() : undefined
                });
              }}
              settings={settings}
              onUpdateSettings={setSettings}
            />
          )}

          {activeView === 'tasks' && (
            <TasksView
              tasks={tasks}
              categories={categories}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onRestoreTask={handleRestoreTask}
              onDuplicateTask={handleDuplicateTask}
              onAddCategory={handleAddCategory}
              createRequest={taskCreationRequest}
              onModalOpenChange={setIsTaskModalOpen}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView
              tasks={tasks}
              categories={categories}
              onUpdateTask={handleUpdateTask}
              onSelectTask={() => setActiveView('tasks')}
            />
          )}

          {activeView === 'notes' && (
            <NotesView
              notes={notes}
              tasks={tasks}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {activeView === 'pomodoro' && (
            <div className="max-w-xl mx-auto pt-6 animate-in zoom-in-95 duration-200">
              <PomodoroTimer onLogActivity={logActivity} />
            </div>
          )}

          {activeView === 'habits' && (
            <HabitsGoalsView
              habits={habits}
              goals={goals}
              onAddHabit={handleAddHabit}
              onToggleHabitDate={handleToggleHabitDate}
              onDeleteHabit={handleDeleteHabit}
              onAddGoal={handleAddGoal}
              onUpdateGoalProgress={handleUpdateGoalProgress}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {activeView === 'stats' && (
            <StatsView
              tasks={tasks}
              categories={categories}
              streak={streak}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={setSettings}
              tasks={tasks}
              categories={categories}
              notes={notes}
              habits={habits}
              goals={goals}
              activityLogs={activityLogs}
              onImportBackup={handleImportBackup}
              onClearDatabase={handleClearDatabase}
            />
          )}

        </div>
      </main>

      {/* Command Palette overlays (Ctrl+P) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(v) => {
          setActiveView(v);
          setIsCommandPaletteOpen(false);
        }}
        onAddTask={() => {
          setActiveView('tasks');
          setIsCommandPaletteOpen(false);
        }}
        onToggleTheme={() => {
          setSettings(prev => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark'
          }));
        }}
        onStartPomodoro={() => {
          setActiveView('pomodoro');
          setIsCommandPaletteOpen(false);
        }}
      />

      {isProfileSetupOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const name = profileName.trim();
              if (!name) return;
              setSettings((current) => ({ ...current, userName: name, suiteName: 'FocusTrak' }));
              setIsProfileSetupOpen(false);
            }}
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-sophisticated-border dark:bg-sophisticated-sidebar"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-sophisticated-accent">Welcome to FocusTrak</p>
            <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-sophisticated-text">What should we call you?</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-sophisticated-muted">Your name stays on this device and personalizes your workspace.</p>
            <input
              autoFocus
              required
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              placeholder="Enter your name"
              className="mt-5 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-sophisticated-accent dark:border-sophisticated-border dark:bg-sophisticated-bg dark:text-sophisticated-text"
            />
            <button type="submit" className="mt-4 w-full rounded-lg bg-sophisticated-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-sophisticated-accent-hover">Continue</button>
          </form>
        </div>
      )}

    </div>
  );
}
