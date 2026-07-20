import React, { useState } from 'react';
import { Task, Category } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Grid, 
  Tag, 
  Layers 
} from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  onUpdateTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
}

export default function CalendarView({
  tasks,
  categories,
  onUpdateTask,
  onSelectTask,
}: CalendarViewProps) {
  const [viewType, setViewType] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  const changeDate = (amount: number) => {
    const nextDate = new Date(currentDate);
    if (viewType === 'month') {
      nextDate.setMonth(nextDate.getMonth() + amount);
    } else if (viewType === 'week') {
      nextDate.setDate(nextDate.getDate() + amount * 7);
    } else {
      nextDate.setDate(nextDate.getDate() + amount);
    }
    setCurrentDate(nextDate);
  };

  // Month Math helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Map out days of the month
  const daysInMonth: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysInMonth.push(null);
  }
  for (let i = 1; i <= lastDate; i++) {
    daysInMonth.push(i);
  }

  // Get tasks scheduled for a specific date
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter(t => t.dueDate === dateStr && !t.recentlyDeleted);
  };

  const handleDateClick = (dayNum: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dateTasks = getTasksForDate(dStr);
    if (dateTasks.length > 0) {
      onSelectTask(dateTasks[0]);
    }
  };

  // Week math helper
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  // Reschedule simulation
  const handleQuickReschedule = (task: Task, daysOffset: number) => {
    const d = new Date(task.dueDate);
    d.setDate(d.getDate() + daysOffset);
    onUpdateTask({
      ...task,
      dueDate: d.toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Calendar toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl text-gray-900 dark:text-sophisticated-text">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => changeDate(-1)}
            className="p-1.5 rounded-lg border border-gray-100 dark:border-sophisticated-border hover:bg-gray-50 dark:hover:bg-sophisticated-active text-gray-600 dark:text-sophisticated-text transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h3 className="text-sm font-bold text-gray-800 dark:text-sophisticated-text font-mono tracking-tight">
            {viewType === 'month' && `${monthNames[month]} ${year}`}
            {viewType === 'week' && `Week of ${getWeekDates()[0].toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
            {viewType === 'day' && currentDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            {viewType === 'agenda' && 'Upcoming Agenda Timeline'}
          </h3>

          <button 
            onClick={() => changeDate(1)}
            className="p-1.5 rounded-lg border border-gray-100 dark:border-sophisticated-border hover:bg-gray-50 dark:hover:bg-sophisticated-active text-gray-600 dark:text-sophisticated-text transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-[10px] font-bold border border-gray-200 dark:border-sophisticated-border hover:bg-gray-50 dark:hover:bg-sophisticated-active text-gray-600 dark:text-sophisticated-text rounded font-mono cursor-pointer"
          >
            TODAY
          </button>
        </div>

        {/* View mode selectors */}
        <div className="flex items-center bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border rounded-lg p-1">
          {['month', 'week', 'day', 'agenda'].map((v) => (
            <button
              key={v}
              onClick={() => setViewType(v as any)}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider font-mono transition-all cursor-pointer ${viewType === v ? 'bg-white dark:bg-sophisticated-active text-sophisticated-accent dark:text-sophisticated-text shadow-xs' : 'text-gray-400 hover:text-gray-600 dark:hover:text-sophisticated-muted'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* View layouts */}
      {viewType === 'month' && (
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-4 overflow-hidden shadow-xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center border-b border-gray-100 dark:border-sophisticated-border pb-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <span key={day} className="text-[10px] font-semibold text-gray-400 dark:text-sophisticated-muted uppercase font-mono tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {daysInMonth.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="bg-gray-50/50 dark:bg-sophisticated-bg/30 min-h-[90px] rounded-lg border border-transparent" />;
              }

              const formattedDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = formattedDayStr === todayStr;
              const dayTasks = getTasksForDate(formattedDayStr);

              return (
                <div 
                  key={day}
                  className={`min-h-[90px] p-1.5 rounded-lg border flex flex-col justify-between transition-all group cursor-pointer ${
                    isToday 
                      ? 'bg-indigo-50/10 dark:bg-sophisticated-active/20 border-sophisticated-accent' 
                      : 'bg-white dark:bg-sophisticated-bg border-gray-100 dark:border-sophisticated-border hover:border-gray-200 dark:hover:border-sophisticated-active'
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-400 dark:text-sophisticated-muted'}`}>
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[8px] font-mono text-gray-400 dark:text-sophisticated-muted font-semibold uppercase">
                        {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Task Stack inside calendar cell */}
                  <div className="space-y-1 my-1 flex-1 overflow-y-auto max-h-[60px]">
                    {dayTasks.slice(0, 2).map(task => (
                      <div 
                        key={task.id}
                        onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}
                        className="text-[9px] px-1 py-0.5 rounded-sm font-medium border-l-2 text-gray-700 dark:text-sophisticated-text truncate cursor-pointer hover:opacity-80 transition-opacity bg-zinc-50 dark:bg-sophisticated-bg/80"
                        style={{ borderLeftColor: task.color || '#6366f1' }}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[8px] text-sophisticated-accent dark:text-sophisticated-accent font-mono text-center font-bold">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewType === 'week' && (
        <div className="grid grid-cols-7 gap-3">
          {getWeekDates().map((wDate) => {
            const dateStr = wDate.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const weekTasks = getTasksForDate(dateStr);

            return (
              <div 
                key={dateStr}
                className={`p-3 bg-white dark:bg-sophisticated-sidebar border rounded-xl flex flex-col min-h-[300px] ${
                  isToday ? 'border-sophisticated-accent bg-indigo-50/10 dark:bg-sophisticated-active/10' : 'border-gray-100 dark:border-sophisticated-border'
                }`}
              >
                <div className="text-center border-b border-gray-100 dark:border-sophisticated-border pb-2 mb-3">
                  <div className="text-[9px] font-mono uppercase text-gray-400 dark:text-sophisticated-muted font-bold">
                    {wDate.toLocaleDateString([], { weekday: 'short' })}
                  </div>
                  <div className={`text-sm font-bold font-mono mt-0.5 ${isToday ? 'text-indigo-600 dark:text-sophisticated-accent' : 'text-gray-800 dark:text-sophisticated-text'}`}>
                    {wDate.getDate()}
                  </div>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {weekTasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="p-2 bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border rounded-lg text-[10px] cursor-pointer hover:border-gray-200 dark:hover:border-sophisticated-active transition-all"
                    >
                      <div className="font-semibold text-gray-800 dark:text-sophisticated-text line-clamp-2">{task.title}</div>
                      <div className="flex items-center gap-1.5 mt-1 text-[8px] font-mono text-gray-400 dark:text-sophisticated-muted">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{task.dueTime}</span>
                      </div>
                      <div className="mt-1.5 flex gap-1">
                        <span className="text-[8px] px-1 py-0.2 rounded font-mono text-white" style={{ backgroundColor: task.color }}>
                          {task.category}
                        </span>
                      </div>
                    </div>
                  ))}
                  {weekTasks.length === 0 && (
                    <div className="text-center text-[9px] text-gray-400 dark:text-sophisticated-muted py-10 font-mono">
                      No Tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewType === 'day' && (
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-5 shadow-xs text-gray-900 dark:text-sophisticated-text">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-sophisticated-border">
            <h4 className="text-xs font-bold text-gray-400 dark:text-sophisticated-muted uppercase tracking-wider font-mono">
              Agenda Timeline for Day
            </h4>
            <span className="text-xs font-bold font-mono text-indigo-600 dark:text-sophisticated-accent">
              {getTasksForDate(currentDate.toISOString().split('T')[0]).length} Tasks Listed
            </span>
          </div>

          <div className="space-y-4">
            {getTasksForDate(currentDate.toISOString().split('T')[0]).length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 dark:text-sophisticated-muted">
                You have an empty agenda today! Rest or load new items in Tasks.
              </div>
            ) : (
              getTasksForDate(currentDate.toISOString().split('T')[0]).map(task => (
                <div 
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="p-4 bg-zinc-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: task.color }} />
                    <div>
                      <h5 className="text-xs font-semibold text-gray-800 dark:text-sophisticated-text">{task.title}</h5>
                      <p className="text-[10px] text-gray-400 dark:text-sophisticated-muted mt-0.5">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[10px] font-mono text-gray-400 dark:text-sophisticated-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.dueTime}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-sophisticated-bg text-gray-500 dark:text-sophisticated-muted border border-gray-100 dark:border-sophisticated-border">
                      {task.category}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleQuickReschedule(task, 1); }}
                      className="px-2 py-0.5 bg-indigo-50 dark:bg-sophisticated-active text-indigo-600 dark:text-sophisticated-text text-[10px] font-semibold rounded hover:bg-indigo-100 cursor-pointer"
                    >
                      +1 Day
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {viewType === 'agenda' && (
        <div className="bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-5 text-gray-900 dark:text-sophisticated-text">
          <div className="space-y-6">
            {tasks
              .filter(t => !t.recentlyDeleted && t.dueDate >= todayStr)
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
              .slice(0, 10)
              .map((task, idx) => (
                <div key={task.id} className="relative flex gap-4 items-start pl-4">
                  {/* Timeline bullet line connector */}
                  <div className="absolute left-0 top-1.5 bottom-0 w-0.5 bg-gray-100 dark:bg-sophisticated-border" />
                  <div className="absolute -left-[3.5px] top-1 w-2 h-2 rounded-full bg-sophisticated-accent" />
                  
                  <div className="flex-1 bg-zinc-50 dark:bg-sophisticated-bg/60 p-3 rounded-lg border border-gray-50 dark:border-sophisticated-border hover:border-sophisticated-accent/40 cursor-pointer transition-all" onClick={() => onSelectTask(task)}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-sophisticated-accent uppercase tracking-wider">{task.dueDate} • {task.dueTime}</span>
                        <h5 className="text-xs font-semibold text-gray-800 dark:text-sophisticated-text mt-0.5">{task.title}</h5>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[9px] font-mono text-white px-2 py-0.5 rounded-sm" style={{ backgroundColor: task.color }}>
                          {task.category}
                        </span>
                        <span className="text-[9px] bg-zinc-100 dark:bg-sophisticated-bg text-zinc-500 dark:text-sophisticated-muted px-1.5 py-0.5 rounded border border-gray-100 dark:border-sophisticated-border">
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {tasks.filter(t => !t.recentlyDeleted && t.dueDate >= todayStr).length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400 dark:text-sophisticated-muted">
                Your future agenda is completely clear. Enjoy the relaxation!
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
