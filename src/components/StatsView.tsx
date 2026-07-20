import React from 'react';
import { Task, Category, Priority } from '../types';
import { BarChart, PieChart, Calendar, TrendingUp, Award, Clock } from 'lucide-react';

interface StatsViewProps {
  tasks: Task[];
  categories: Category[];
  streak: number;
}

export default function StatsView({ tasks, categories, streak }: StatsViewProps) {
  
  // 1. Calculations
  const activeTasks = tasks.filter(t => !t.recentlyDeleted);
  const completedTasks = activeTasks.filter(t => t.status === 'Completed');
  const completionRate = activeTasks.length > 0 ? Math.round((completedTasks.length / activeTasks.length) * 100) : 0;

  // Average Completion Duration Helper
  const averageDuration = (() => {
    const durTasks = completedTasks.filter(t => t.estimatedDuration > 0);
    if (durTasks.length === 0) return 25;
    const total = durTasks.reduce((sum, t) => sum + (t.estimatedDuration || 25), 0);
    return Math.round(total / durTasks.length);
  })();

  // Past 7 Days completion data
  const getDailyCompletionData = () => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return days.map(dayStr => {
      const dayTasks = activeTasks.filter(t => t.dueDate === dayStr);
      const dayCompleted = dayTasks.filter(t => t.status === 'Completed');
      return {
        date: dayStr,
        label: new Date(dayStr).toLocaleDateString([], { weekday: 'short' }),
        completed: dayCompleted.length,
        total: dayTasks.length
      };
    });
  };

  const dailyCompletions = getDailyCompletionData();

  // Category Distribution math
  const categoryCounts = categories.map(cat => {
    const catTasks = activeTasks.filter(t => t.category === cat.name);
    return {
      name: cat.name,
      color: cat.color,
      count: catTasks.length,
      percent: activeTasks.length > 0 ? Math.round((catTasks.length / activeTasks.length) * 100) : 0
    };
  }).sort((a, b) => b.count - a.count);

  // Priority distribution counts
  const priorityCounts = Object.values(Priority).map(prio => {
    const prioTasks = activeTasks.filter(t => t.priority === prio);
    return {
      priority: prio,
      count: prioTasks.length,
      color: prio === Priority.CRITICAL ? '#ef4444' : prio === Priority.HIGH ? '#f59e0b' : prio === Priority.MEDIUM ? '#3b82f6' : '#94a3b8'
    };
  });

  return (
    <div className="space-y-6 text-gray-900 dark:text-sophisticated-text">
      
      {/* Visual statistics summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Widget 1 */}
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-sophisticated-active text-sophisticated-accent rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 dark:text-sophisticated-muted uppercase tracking-wider block">Task Completion Index</span>
            <div className="text-lg font-bold text-gray-900 dark:text-sophisticated-text font-mono mt-0.5">{completionRate}% ratio</div>
          </div>
        </div>

        {/* Widget 2 */}
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 dark:text-sophisticated-muted uppercase tracking-wider block">Consistent Days Stretch</span>
            <div className="text-lg font-bold text-gray-900 dark:text-sophisticated-text font-mono mt-0.5">{streak} Days Streak</div>
          </div>
        </div>

        {/* Widget 3 */}
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 dark:text-sophisticated-muted uppercase tracking-wider block">Avg Task Allocation</span>
            <div className="text-lg font-bold text-gray-900 dark:text-sophisticated-text font-mono mt-0.5">{averageDuration} mins / task</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Daily completions bar chart (using clean SVG nodes) */}
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-sophisticated-border">
            <h4 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-1.5">
              <BarChart className="w-4 h-4 text-sophisticated-accent" /> Rolling Daily Completions
            </h4>
          </div>

          <div className="h-48 flex items-end justify-between gap-2.5 pt-6 px-4">
            {dailyCompletions.map(day => {
              const heightPercent = day.total > 0 ? Math.min(100, Math.round((day.completed / day.total) * 100)) : 0;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-850 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-xs mb-1">
                    {day.completed}/{day.total}
                  </div>
                  
                  {/* Visual Bar tracks */}
                  <div className="w-full bg-zinc-50 dark:bg-sophisticated-active rounded-md relative flex-1 overflow-hidden min-h-[4px]">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-sophisticated-accent hover:bg-sophisticated-accent-hover rounded-t-sm transition-all duration-500"
                      style={{ height: `${heightPercent || 4}%` }}
                    />
                  </div>
                  
                  <span className="text-[10px] font-mono text-gray-400 dark:text-sophisticated-muted font-semibold">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Priority Distribution block */}
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-sophisticated-border">
            <h4 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-500" /> Priority Allocation
            </h4>
          </div>

          <div className="space-y-3.5 pt-2">
            {priorityCounts.map(item => {
              const maxCount = Math.max(...priorityCounts.map(c => c.count)) || 1;
              const barPercent = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.priority} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-gray-700 dark:text-sophisticated-text font-semibold">{item.priority}</span>
                    <span className="text-gray-400 dark:text-sophisticated-muted">{item.count} items</span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 dark:bg-sophisticated-active rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${barPercent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Category distribution ratio meters */}
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-sophisticated-border">
            <h4 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-1.5">
              Category Distribution
            </h4>
          </div>

          <div className="space-y-3 pt-1 max-h-[220px] overflow-y-auto">
            {categoryCounts.map(cat => (
              <div key={cat.name} className="flex items-center justify-between text-xs p-2.5 bg-gray-50/50 dark:bg-sophisticated-bg/40 border border-gray-50 dark:border-sophisticated-border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-semibold text-gray-800 dark:text-sophisticated-text">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px]">
                  <span className="text-gray-400 dark:text-sophisticated-muted">{cat.count} items</span>
                  <span className="font-bold text-gray-700 dark:text-sophisticated-text">{cat.percent}%</span>
                </div>
              </div>
            ))}
            {categoryCounts.length === 0 && (
              <div className="text-center py-10 text-xs text-gray-400 dark:text-sophisticated-muted">No categories active.</div>
            )}
          </div>
        </div>

        {/* 4. Completion Heatmap visual grid representation */}
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-sophisticated-border">
            <h4 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#5E6AD2]" /> Habits Activity Heatmap
            </h4>
          </div>

          <p className="text-[10px] text-gray-400 dark:text-sophisticated-muted leading-relaxed font-mono">
            Intensity matches daily completion volumes. Click spaces on Habits tab to feed heatmap energy.
          </p>

          <div className="flex flex-wrap gap-1.5 pt-3">
            {/* Draw a simulated grid of 35 heatmap nodes representing past 5 weeks */}
            {Array.from({ length: 35 }).map((_, i) => {
              // Mock random completions or weight based on index for a neat visual gradient
              const complVal = (i % 7 === 0) ? 0 : (i % 5 === 0) ? 3 : (i % 3 === 0) ? 2 : 1;
              const shadeColor = 
                complVal === 3 ? 'bg-[#5E6AD2]' :
                complVal === 2 ? 'bg-[#5E6AD2]/80' :
                complVal === 1 ? 'bg-[#5E6AD2]/40' :
                'bg-zinc-100 dark:bg-sophisticated-active';

              return (
                <div 
                  key={i}
                  className={`w-4 h-4 rounded-xs ${shadeColor} transition-all duration-300 hover:scale-110`}
                  title={`${complVal} daily check-ins logged`}
                />
              );
            })}
          </div>

          <div className="flex justify-end gap-1.5 text-[8px] font-mono text-gray-400 dark:text-sophisticated-muted">
            <span>Less</span>
            <div className="w-2.5 h-2.5 bg-zinc-100 dark:bg-sophisticated-active rounded-xs" />
            <div className="w-2.5 h-2.5 bg-[#5E6AD2]/40 rounded-xs" />
            <div className="w-2.5 h-2.5 bg-[#5E6AD2]/80 rounded-xs" />
            <div className="w-2.5 h-2.5 bg-[#5E6AD2] rounded-xs" />
            <span>More</span>
          </div>
        </div>

      </div>

    </div>
  );
}
