import React, { useState } from 'react';
import { Task, Category, Priority, Status } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Kanban, 
  List, 
  MoreHorizontal, 
  Pin, 
  Star, 
  Trash2, 
  Copy, 
  CheckSquare, 
  Paperclip, 
  Tag, 
  Clock, 
  AlertCircle, 
  Undo2, 
  Maximize2, 
  Lock, 
  Link as LinkIcon 
} from 'lucide-react';

const CUSTOM_CATEGORY_VALUE = '__custom_category__';

interface TasksViewProps {
  tasks: Task[];
  categories: Category[];
  onAddTask: (task: Omit<Task, 'id' | 'createdDate'>) => Promise<void>;
  onUpdateTask: (task: Task) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onRestoreTask: (taskId: string) => Promise<void>;
  onDuplicateTask: (task: Task) => Promise<void>;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  createRequest?: number;
  onModalOpenChange?: (isOpen: boolean) => void;
}

export default function TasksView({
  tasks,
  categories,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onRestoreTask,
  onDuplicateTask,
  onAddCategory,
  createRequest = 0,
  onModalOpenChange,
}: TasksViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Selected tasks for multi-select
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  
  // Deleted tasks stack for Undo
  const [deletedStack, setDeletedStack] = useState<string[]>([]);

  // Task creation/edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Personal');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [status, setStatus] = useState<Status>(Status.PENDING);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('12:00');
  const [estimatedDuration, setEstimatedDuration] = useState(25);
  const [actualDuration, setActualDuration] = useState(0);
  const [reminder, setReminder] = useState('15min');
  const [repeat, setRepeat] = useState('none');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [pinned, setPinned] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setCategory(categories[0]?.name || 'Personal');
    setIsCustomCategory(false);
    setCustomCategory('');
    setPriority(Priority.MEDIUM);
    setStatus(Status.PENDING);
    setDueDate(new Date().toISOString().split('T')[0]);
    setDueTime('12:00');
    setEstimatedDuration(25);
    setActualDuration(0);
    setReminder('15min');
    setRepeat('none');
    setNotes('');
    setTags([]);
    setPinned(false);
    setFavorite(false);
    setDependencies([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    if (createRequest > 0) openAddModal();
  }, [createRequest]);

  React.useEffect(() => {
    onModalOpenChange?.(isModalOpen);
    return () => onModalOpenChange?.(false);
  }, [isModalOpen, onModalOpenChange]);

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setIsCustomCategory(!categories.some((item) => item.name === task.category));
    setCustomCategory(task.category);
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate);
    setDueTime(task.dueTime);
    setEstimatedDuration(task.estimatedDuration);
    setActualDuration(task.actualDuration);
    setReminder(task.reminder);
    setRepeat(task.repeat);
    setNotes(task.notes);
    setTags(task.tags || []);
    setPinned(task.pinned);
    setFavorite(task.favorite);
    setDependencies(task.dependencies || []);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCategory = (isCustomCategory ? customCategory : category).trim();
    if (!title.trim() || !selectedCategory) {
      setFormError('A task title and category are required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    if (!categories.some((item) => item.name.toLowerCase() === selectedCategory.toLowerCase())) {
      onAddCategory({ name: selectedCategory, color: '#6366f1', icon: 'Tag' });
    }

    const taskColor = categories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase())?.color || '#6366f1';

    try {
      if (editingTask) {
        await onUpdateTask({
        ...editingTask,
        title,
        description,
        category: selectedCategory,
        priority,
        status,
        dueDate,
        dueTime,
        estimatedDuration,
        actualDuration,
        reminder,
        repeat,
        notes,
        tags,
        pinned,
        favorite,
        color: taskColor,
        dependencies,
        });
      } else {
        await onAddTask({
        title,
        description,
        category: selectedCategory,
        priority,
        status,
        dueDate,
        dueTime,
        estimatedDuration,
        actualDuration,
        reminder,
        repeat,
        notes,
        tags,
        pinned,
        favorite,
        color: taskColor,
        dependencies,
        attachments: [],
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save task:', error);
      setFormError('Could not save this task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Filter tasks
  const visibleTasks = tasks.filter(t => {
    if (t.recentlyDeleted) return false;
    
    // search
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase()) ||
                          t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    // category
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    
    // priority
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    
    // status
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Pinned tasks prioritized
  const sortedTasks = [...visibleTasks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  // Toggle complete with dependency checking!
  const handleToggleComplete = (task: Task) => {
    if (task.status !== Status.COMPLETED) {
      // Check if any of its dependency tasks are NOT completed
      const incompleteDependencies = (task.dependencies || []).map(id => tasks.find(t => t.id === id)).filter(t => t && t.status !== Status.COMPLETED);
      
      if (incompleteDependencies.length > 0) {
        alert(`Cannot complete. This task depends on the following incomplete tasks: ${incompleteDependencies.map(t => t?.title).join(', ')}`);
        return;
      }
    }

    onUpdateTask({
      ...task,
      status: task.status === Status.COMPLETED ? Status.PENDING : Status.COMPLETED,
      completedDate: task.status !== Status.COMPLETED ? new Date().toISOString() : undefined
    });
  };

  // Recently deleted list
  const recentlyDeletedTasks = tasks.filter(t => t.recentlyDeleted);

  const handleTaskDelete = (id: string) => {
    onDeleteTask(id);
    setDeletedStack(prev => [...prev, id]);
  };

  const handleUndo = () => {
    if (deletedStack.length > 0) {
      const lastId = deletedStack[deletedStack.length - 1];
      onRestoreTask(lastId);
      setDeletedStack(prev => prev.slice(0, -1));
    }
  };

  // Bulk Actions
  const handleToggleSelect = (id: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkComplete = () => {
    selectedTaskIds.forEach(id => {
      const task = tasks.find(t => t.id === id);
      if (task && task.status !== Status.COMPLETED) {
        onUpdateTask({ ...task, status: Status.COMPLETED });
      }
    });
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    selectedTaskIds.forEach(id => {
      onDeleteTask(id);
    });
    setSelectedTaskIds([]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            Tasks Manager
          </h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
            Create, schedule, organize and link your tasks with high fidelity boards or timelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {deletedStack.length > 0 && (
            <button
              onClick={handleUndo}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo Delete</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and View bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl">
        {/* Search */}
        <div className="flex items-center bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border rounded-lg px-3 py-1.5 w-full lg:max-w-xs">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            className="bg-transparent text-xs text-gray-800 dark:text-sophisticated-text placeholder-gray-400 dark:placeholder-sophisticated-muted outline-none w-full"
            placeholder="Search titles, descriptions, tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border rounded-lg px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-transparent text-xs text-gray-600 dark:text-sophisticated-text outline-none py-0.5 cursor-pointer dark:[color-scheme:dark]"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border rounded-lg px-2.5 py-1">
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="bg-transparent text-xs text-gray-600 dark:text-sophisticated-text outline-none py-0.5 cursor-pointer dark:[color-scheme:dark]"
            >
              <option value="all">All Priorities</option>
              {Object.values(Priority).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border rounded-lg px-2.5 py-1">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs text-gray-600 dark:text-sophisticated-text outline-none py-0.5 cursor-pointer dark:[color-scheme:dark]"
            >
              <option value="all">All Statuses</option>
              {Object.values(Status).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border rounded-lg p-1 self-start lg:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-sophisticated-active text-sophisticated-accent dark:text-white shadow-xs' : 'text-gray-400 hover:text-gray-600 dark:hover:text-sophisticated-text'}`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'kanban' ? 'bg-white dark:bg-sophisticated-active text-sophisticated-accent dark:text-white shadow-xs' : 'text-gray-400 hover:text-gray-600 dark:hover:text-sophisticated-text'}`}
            title="Kanban Board View"
          >
            <Kanban className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-Select Action Bar */}
      {selectedTaskIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
              {selectedTaskIds.length} tasks selected for bulk operation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkComplete}
              className="px-2.5 py-1 bg-white dark:bg-zinc-800 text-xs text-indigo-600 dark:text-indigo-400 font-semibold rounded shadow-xs hover:bg-indigo-50 dark:hover:bg-zinc-700 border border-indigo-100 dark:border-indigo-900/40"
            >
              Mark Completed
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-600 dark:text-rose-400 font-semibold rounded hover:bg-rose-100 dark:hover:bg-rose-900/50"
            >
              Delete All
            </button>
            <button
              onClick={() => setSelectedTaskIds([])}
              className="text-xs text-gray-500 dark:text-zinc-400 hover:underline px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Task List/Board Body */}
      {viewMode === 'list' ? (
        <div className="task-list bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl divide-y divide-gray-100 dark:divide-sophisticated-border overflow-hidden">
          {sortedTasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 dark:text-sophisticated-muted">
              No tasks found. Try tweaking your filters or create a new task!
            </div>
          ) : (
            sortedTasks.map(task => {
              const isSelected = selectedTaskIds.includes(task.id);
              const hasIncompleteDependencies = (task.dependencies || [])
                .map(id => tasks.find(t => t.id === id))
                .some(t => t && t.status !== Status.COMPLETED);

              return (
                <div 
                  key={task.id} 
                  className={`task-row p-3.5 flex items-center justify-between group transition-all ${
                    isSelected ? 'bg-indigo-50/20 dark:bg-sophisticated-active/40' : 'hover:bg-gray-50/50 dark:hover:bg-sophisticated-active/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(task.id)}
                      className="w-3.5 h-3.5 rounded border-gray-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    
                    <input
                      type="checkbox"
                      checked={task.status === Status.COMPLETED}
                      onChange={() => handleToggleComplete(task)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        {task.pinned && <Pin className="w-3 h-3 text-amber-500 rotate-45" />}
                        {task.favorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                        <span 
                          onClick={() => openEditModal(task)}
                          className={`text-xs font-semibold cursor-pointer ${
                            task.status === Status.COMPLETED ? 'line-through text-gray-400 dark:text-zinc-500' : 'text-gray-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400'
                          }`}
                        >
                          {task.title}
                        </span>
                        {hasIncompleteDependencies && (
                          <span className="flex items-center gap-0.5 text-[9px] text-rose-500 font-mono" title="A task dependency is incomplete">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-gray-400 dark:text-zinc-400 mt-0.5 line-clamp-1 max-w-xl">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span 
                          className="text-[9px] px-1.5 py-0.2 rounded-sm font-mono text-white" 
                          style={{ backgroundColor: task.color || '#6366f1' }}
                        >
                          {task.category}
                        </span>

                        <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Due: {task.dueDate} {task.dueTime}
                        </span>

                        {task.tags && task.tags.map(tag => (
                          <span key={tag} className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.2 rounded font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                      task.priority === Priority.CRITICAL ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' :
                      task.priority === Priority.HIGH ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' :
                      task.priority === Priority.MEDIUM ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' :
                      'bg-gray-50 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {task.priority}
                    </span>

                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                      task.status === Status.IN_PROGRESS ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300' :
                      task.status === Status.COMPLETED ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300' :
                      task.status === Status.CANCELLED ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800' :
                      'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300'
                    }`}>
                      {task.status}
                    </span>

                    {/* Desktop Toolbar buttons on hover */}
                    <div className="task-actions flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onDuplicateTask(task)}
                        className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-200"
                        title="Duplicate Task"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleTaskDelete(task.id)}
                        className="p-1 rounded text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Kanban Board Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[Status.PENDING, Status.IN_PROGRESS, Status.COMPLETED].map(statusCol => {
            const colTasks = sortedTasks.filter(t => t.status === statusCol);
            return (
              <div key={statusCol} className="bg-zinc-50 dark:bg-sophisticated-sidebar/60 p-3.5 rounded-xl border border-gray-100 dark:border-sophisticated-border flex flex-col min-h-[450px]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono">
                    {statusCol === Status.PENDING ? 'To Do' : statusCol === Status.IN_PROGRESS ? 'In Progress' : 'Completed'}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-sophisticated-active text-gray-500 dark:text-sophisticated-muted border border-gray-100 dark:border-sophisticated-border">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="p-3 bg-white dark:bg-sophisticated-card border border-gray-100 dark:border-sophisticated-border rounded-lg shadow-xs hover:shadow-md hover:border-gray-200 dark:hover:border-zinc-700 transition-all cursor-pointer group"
                      onClick={() => openEditModal(task)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-gray-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                          {task.title}
                        </div>
                        {task.pinned && <Pin className="w-3 h-3 text-amber-500 shrink-0" />}
                      </div>

                      {task.description && (
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1 mt-2.5">
                        <span className="text-[8px] font-mono px-1.5 py-0.2 rounded-sm text-white" style={{ backgroundColor: task.color }}>
                          {task.category}
                        </span>
                        <span className={`text-[8px] font-semibold px-1.5 py-0.2 rounded-full ${
                          task.priority === Priority.CRITICAL ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' :
                          task.priority === Priority.HIGH ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                          task.priority === Priority.MEDIUM ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' :
                          'bg-gray-50 text-gray-600 dark:bg-zinc-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 dark:border-zinc-900/60 text-[9px] text-gray-400 dark:text-zinc-500 font-mono">
                        <span>{task.dueDate}</span>
                        <span>{task.dueTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Creation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <form 
            onSubmit={handleSave}
            className="w-full max-w-xl max-h-[92dvh] md:max-h-none flex flex-col bg-white dark:bg-[#1e1e2e] border border-gray-200 dark:border-zinc-800 rounded-t-[1.75rem] md:rounded-xl shadow-2xl overflow-hidden mobile-task-sheet"
          >
            <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="flex-1 min-h-0 px-5 py-4 space-y-4 overflow-y-auto md:max-h-[500px]">
              {formError && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{formError}</p>}
              <details className="task-form-section" open>
                <summary>Basic</summary>
              {/* Task Title */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-zinc-100 outline-none"
                  placeholder="e.g. Prepare system slides for projects panel"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-1">Task Description</label>
                <textarea
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-zinc-100 outline-none h-16 resize-none"
                  placeholder="Elaborate details, links, credentials, or instructions..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {/* Row: Category, Priority, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-1">Category</label>
                  <select
                    value={isCustomCategory ? CUSTOM_CATEGORY_VALUE : category}
                    onChange={e => {
                      const nextCategory = e.target.value;
                      setIsCustomCategory(nextCategory === CUSTOM_CATEGORY_VALUE);
                      if (nextCategory !== CUSTOM_CATEGORY_VALUE) setCategory(nextCategory);
                    }}
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-zinc-100 outline-none dark:[color-scheme:dark]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value={CUSTOM_CATEGORY_VALUE}>Custom category…</option>
                  </select>
                  {isCustomCategory && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      placeholder="Type your category name"
                      autoFocus
                      className="mt-2 w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-zinc-100 outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as Priority)}
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-zinc-100 outline-none dark:[color-scheme:dark]"
                  >
                    {Object.values(Priority).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as Status)}
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-zinc-100 outline-none dark:[color-scheme:dark]"
                  >
                    {Object.values(Status).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              </details>

              <details className="task-form-section">
                <summary>Scheduling</summary>
              {/* Row: Due Date, Due Time, Estimated Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-zinc-100 outline-none dark:[color-scheme:dark]"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-1">Due Time</label>
                  <input
                    type="time"
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-zinc-100 outline-none dark:[color-scheme:dark]"
                    value={dueTime}
                    onChange={e => setDueTime(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-1">Est. Duration (mins)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-zinc-100 outline-none"
                    value={estimatedDuration}
                    onChange={e => setEstimatedDuration(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Row: Repeat, Reminder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-1">Reminder</label>
                  <select
                    value={reminder}
                    onChange={e => setReminder(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-zinc-100 outline-none dark:[color-scheme:dark]"
                  >
                    <option value="none">No Reminder</option>
                    <option value="5min">5 minutes before</option>
                    <option value="15min">15 minutes before</option>
                    <option value="30min">30 minutes before</option>
                    <option value="1hr">1 hour before</option>
                    <option value="1day">1 day before</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-1">Repeat Cycle</label>
                  <select
                    value={repeat}
                    onChange={e => setRepeat(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-zinc-100 outline-none dark:[color-scheme:dark]"
                  >
                    <option value="none">Once (No Repeat)</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              </details>

              <details className="task-form-section">
                <summary>Advanced</summary>
              {/* Tags Section */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-1">Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-zinc-100 outline-none"
                    placeholder="Add custom tags... e.g. chemistry, sprint-1"
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-200 rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag, i) => (
                    <span key={tag} className="flex items-center gap-1 text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-mono">
                      #{tag}
                      <button type="button" onClick={() => removeTag(i)} className="hover:text-rose-600 font-bold">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Task Dependencies */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-indigo-500" /> Linked Dependencies (Must complete before this)
                </label>
                <div className="max-h-24 overflow-y-auto border border-gray-100 dark:border-zinc-800 rounded-lg p-2 bg-gray-50/50 dark:bg-zinc-800/30 space-y-1.5">
                  {tasks.filter(t => t.id !== editingTask?.id && !t.recentlyDeleted).length === 0 ? (
                    <div className="text-[10px] text-gray-400 dark:text-zinc-500 text-center py-2">No other tasks available for linking.</div>
                  ) : (
                    tasks
                      .filter(t => t.id !== editingTask?.id && !t.recentlyDeleted)
                      .map(t => {
                        const isLinked = dependencies.includes(t.id);
                        return (
                          <label key={t.id} className="flex items-center gap-2 cursor-pointer text-[11px] text-gray-700 dark:text-zinc-300">
                            <input
                              type="checkbox"
                              checked={isLinked}
                              onChange={() => {
                                setDependencies(prev => 
                                  isLinked ? prev.filter(id => id !== t.id) : [...prev, t.id]
                                );
                              }}
                              className="w-3.5 h-3.5 rounded border-gray-300 dark:border-zinc-700 text-indigo-600"
                            />
                            <span className={t.status === Status.COMPLETED ? 'line-through text-gray-400' : ''}>{t.title}</span>
                          </label>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Pinned & Favorite Flags */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={e => setPinned(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-gray-700 dark:text-zinc-300 flex items-center gap-1">
                    <Pin className="w-3.5 h-3.5 text-amber-500" /> Pin task to core Dashboard
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={favorite}
                    onChange={e => setFavorite(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-gray-700 dark:text-zinc-300 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500" /> Bookmark to favorites
                  </span>
                </label>
              </div>
              </details>

            </div>

            <div className="task-modal-actions shrink-0 px-5 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {isSaving ? 'Saving…' : editingTask ? 'Save Changes' : 'Save Task'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
