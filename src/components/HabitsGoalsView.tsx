import React, { useState } from 'react';
import { Habit, Goal } from '../types';
import { 
  Plus, 
  Flame, 
  Check, 
  Target, 
  Calendar, 
  TrendingUp, 
  Trash2, 
  Award,
  Sparkles
} from 'lucide-react';

interface HabitsGoalsViewProps {
  habits: Habit[];
  goals: Goal[];
  onAddHabit: (habit: Omit<Habit, 'id' | 'streak' | 'history'>) => void;
  onToggleHabitDate: (habitId: string, dateStr: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoalProgress: (goalId: string, progress: number) => void;
  onDeleteGoal: (goalId: string) => void;
}

export default function HabitsGoalsView({
  habits,
  goals,
  onAddHabit,
  onToggleHabitDate,
  onDeleteHabit,
  onAddGoal,
  onUpdateGoalProgress,
  onDeleteGoal,
}: HabitsGoalsViewProps) {
  // Habit form
  const [habitName, setHabitName] = useState('');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekly'>('daily');
  const [habitColor, setHabitColor] = useState('#6366f1');

  // Goal form
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState(10);
  const [goalCurrent, setGoalCurrent] = useState(0);
  const [goalDeadline, setGoalDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [goalCategory, setGoalCategory] = useState('Personal');
  const [goalColor, setGoalColor] = useState('#10b981');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper for past 7 days of Habit completions
  const getPast7Days = () => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
  };

  const past7Days = getPast7Days();

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    onAddHabit({
      name: habitName.trim(),
      frequency: habitFrequency,
      color: habitColor,
    });
    setHabitName('');
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) return;
    onAddGoal({
      name: goalName.trim(),
      target: Number(goalTarget),
      current: Number(goalCurrent),
      deadline: goalDeadline,
      category: goalCategory,
      color: goalColor,
    });
    setGoalName('');
    setGoalCurrent(0);
    setGoalTarget(10);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Habit Tracker Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" /> Daily Habits Loop
            </h3>
            <p className="text-xs text-gray-400 dark:text-sophisticated-muted mt-0.5">
              Reinforce positive cycles. Double click daily slots to log completion state.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form to add Habit */}
          <form onSubmit={handleCreateHabit} className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border p-4 rounded-xl space-y-3.5 self-start shadow-xs text-gray-900 dark:text-sophisticated-text">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-sophisticated-muted uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sophisticated-accent" /> Start Habit Loop
            </h4>
            
            <div>
              <label className="block text-[9px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-1 uppercase">Habit Title</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border px-3 py-1.5 text-xs outline-none rounded text-gray-850 dark:text-sophisticated-text focus:border-sophisticated-accent"
                placeholder="e.g. Solve 2 LeetCode problems"
                value={habitName}
                onChange={e => setHabitName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-1 uppercase">Frequency</label>
                <select
                  value={habitFrequency}
                  onChange={e => setHabitFrequency(e.target.value as any)}
                  className="w-full bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border px-2.5 py-1 text-xs outline-none rounded text-gray-800 dark:text-sophisticated-text focus:border-sophisticated-accent dark:[color-scheme:dark]"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-1 uppercase">Vibe Color</label>
                <select
                  value={habitColor}
                  onChange={e => setHabitColor(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border px-2.5 py-1 text-xs outline-none rounded text-gray-800 dark:text-sophisticated-text focus:border-sophisticated-accent dark:[color-scheme:dark]"
                >
                  <option value="#6366f1">Indigo</option>
                  <option value="#10b981">Emerald</option>
                  <option value="#f59e0b">Amber</option>
                  <option value="#f43f5e">Rose</option>
                  <option value="#3b82f6">Ocean Blue</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Start Loop
            </button>
          </form>

          {/* Habits Catalog list */}
          <div className="lg:col-span-2 space-y-3">
            {habits.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl dark:text-sophisticated-muted">
                No active habits defined. Formulate your routine on the left!
              </div>
            ) : (
              habits.map(habit => (
                <div key={habit.id} className="p-4 bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-gray-200 dark:hover:border-sophisticated-border transition-all shadow-xs text-gray-900 dark:text-sophisticated-text">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
                      <h4 className="text-xs font-semibold text-gray-800 dark:text-sophisticated-text">{habit.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider dark:text-sophisticated-muted">{habit.frequency} frequency</span>
                      <span className="text-[9px] font-mono text-amber-500 font-bold flex items-center gap-0.5">
                        <Flame className="w-3 h-3 shrink-0 animate-pulse" /> {habit.streak} day streak
                      </span>
                    </div>
                  </div>

                  {/* 7-Day Completion slots tracker */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {past7Days.map(date => {
                        const isCompleted = habit.history?.[date] || false;
                        const dayLabel = new Date(date).toLocaleDateString([], { weekday: 'narrow' });
                        return (
                          <div 
                            key={date}
                            onClick={() => onToggleHabitDate(habit.id, date)}
                            className={`w-7 h-7 rounded-md cursor-pointer border flex flex-col justify-center items-center text-[9px] font-bold font-mono transition-all ${
                              isCompleted 
                                ? 'text-white border-transparent' 
                                : 'text-gray-400 border-gray-100 dark:border-sophisticated-border bg-gray-50 dark:bg-sophisticated-bg/40 hover:border-gray-200 dark:hover:border-sophisticated-active'
                            }`}
                            style={{ backgroundColor: isCompleted ? habit.color : undefined }}
                            title={`${date}: ${isCompleted ? 'Completed' : 'Pending'}`}
                          >
                            <span>{dayLabel}</span>
                            {isCompleted && <Check className="w-2.5 h-2.5 mt-0.5 font-bold" />}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Terminate Habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. Goal Tracker Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" /> Milestone Goals Tracker
          </h3>
          <p className="text-xs text-gray-400 dark:text-sophisticated-muted mt-0.5">
            Visualize ambitious milestones, deadlines, and active progression ratios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goal Builder Form */}
          <form onSubmit={handleCreateGoal} className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border p-4 rounded-xl space-y-3.5 self-start shadow-xs text-gray-900 dark:text-sophisticated-text">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-sophisticated-muted uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-500" /> Configure Goal
            </h4>

            <div>
              <label className="block text-[9px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-1 uppercase">Goal Title</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border px-3 py-1.5 text-xs outline-none rounded text-gray-800 dark:text-sophisticated-text focus:border-sophisticated-accent"
                placeholder="e.g. Master React hooks & routers"
                value={goalName}
                onChange={e => setGoalName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-1 uppercase">Current Value</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border px-2.5 py-1 text-xs outline-none rounded text-gray-800 dark:text-sophisticated-text focus:border-sophisticated-accent dark:[color-scheme:dark]"
                  value={goalCurrent}
                  onChange={e => setGoalCurrent(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-1 uppercase">Target Value</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border px-2.5 py-1 text-xs outline-none rounded text-gray-800 dark:text-sophisticated-text focus:border-sophisticated-accent"
                  value={goalTarget}
                  onChange={e => setGoalTarget(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-1 uppercase">Deadline</label>
                <input
                  type="date"
                  className="w-full bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border px-2 py-1 text-xs outline-none rounded text-gray-800 dark:text-sophisticated-text focus:border-sophisticated-accent"
                  value={goalDeadline}
                  onChange={e => setGoalDeadline(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-1 uppercase">Goal Color</label>
                <select
                  value={goalColor}
                  onChange={e => setGoalColor(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border px-2.5 py-1 text-xs outline-none rounded text-gray-800 dark:text-sophisticated-text focus:border-sophisticated-accent"
                >
                  <option value="#10b981">Emerald</option>
                  <option value="#3b82f6">Ocean Blue</option>
                  <option value="#6366f1">Indigo</option>
                  <option value="#f59e0b">Amber</option>
                  <option value="#f43f5e">Rose</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Initialize Goal
            </button>
          </form>

          {/* Goal Metrics List */}
          <div className="lg:col-span-2 space-y-4">
            {goals.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl dark:text-sophisticated-muted">
                No goals tracked yet. Establish your milestones on the left!
              </div>
            ) : (
              goals.map(goal => {
                const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                return (
                  <div key={goal.id} className="p-4 bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl space-y-3.5 shadow-xs text-gray-900 dark:text-sophisticated-text">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-800 dark:text-sophisticated-text">{goal.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-400 dark:text-sophisticated-muted font-mono uppercase">
                          <Calendar className="w-3 h-3" /> Target Deadline: {goal.deadline}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onDeleteGoal(goal.id)}
                          className="p-1 text-gray-400 hover:text-rose-500 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Ratio Indicator & Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-gray-400 dark:text-sophisticated-muted">Progress Ratio</span>
                        <span className="font-semibold text-gray-700 dark:text-sophisticated-text">
                          {goal.current} / {goal.target} ({percent}%)
                        </span>
                      </div>

                      {/* Bar track */}
                      <div className="w-full h-2 bg-gray-50 dark:bg-sophisticated-bg rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%`, backgroundColor: goal.color }}
                        />
                      </div>

                      {/* Simple progress slider adjustment tool */}
                      <div className="flex items-center gap-2.5 pt-1.5">
                        <span className="text-[9px] text-gray-400 dark:text-sophisticated-muted font-mono">Update Progress:</span>
                        <input
                          type="range"
                          min="0"
                          max={goal.target}
                          value={goal.current}
                          onChange={(e) => onUpdateGoalProgress(goal.id, Number(e.target.value))}
                          className="flex-1 accent-indigo-600 h-1 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
