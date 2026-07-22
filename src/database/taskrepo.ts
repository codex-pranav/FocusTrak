import { getDatabase } from './db';
import { Task } from '../types';

const STORAGE_KEY = 'productivity.tasks.v1';
const SQLITE_MIGRATION_KEY = 'productivity.tasks.sqlite-migrated.v1';

type TaskRow = {
  id: string; title: string; description: string | null; category: string | null;
  priority: Task['priority']; status: Task['status']; due_date: string | null;
  due_time: string | null; created_date: string; completed_date: string | null;
  estimated_duration: number | null; actual_duration: number | null;
  reminder: string | null; repeat_rule: string | null; notes: string | null;
  tags: string | null; attachments: string | null; color: string | null;
  pinned: number | boolean | null; favorite: number | boolean | null;
  dependencies: string | null; recently_deleted: number | boolean | null;
};

function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function readFallback(): Task[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter(isTask) : [];
  } catch {
    return [];
  }
}

function writeFallback(tasks: Task[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const task = value as Partial<Task>;
  return typeof task.id === 'string' && typeof task.title === 'string' && typeof task.createdDate === 'string';
}

function parseList(value: string | null): string[] {
  try {
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string') ? parsed : [];
  } catch {
    return [];
  }
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    category: row.category ?? 'Personal',
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date ?? '',
    dueTime: row.due_time ?? '',
    createdDate: row.created_date,
    completedDate: row.completed_date ?? undefined,
    estimatedDuration: row.estimated_duration ?? 0,
    actualDuration: row.actual_duration ?? 0,
    reminder: row.reminder ?? 'none',
    repeat: row.repeat_rule ?? 'none',
    notes: row.notes ?? '',
    tags: parseList(row.tags),
    attachments: parseList(row.attachments),
    color: row.color ?? '#6366f1',
    pinned: Boolean(row.pinned),
    favorite: Boolean(row.favorite),
    dependencies: parseList(row.dependencies),
    recentlyDeleted: Boolean(row.recently_deleted),
  };
}

function values(task: Task) {
  return [
    task.id, task.title, task.description, task.category, task.priority, task.status,
    task.dueDate, task.dueTime, task.createdDate, task.completedDate ?? null,
    task.estimatedDuration, task.actualDuration, task.reminder, task.repeat, task.notes,
    JSON.stringify(task.tags), JSON.stringify(task.attachments), task.color,
    task.pinned ? 1 : 0, task.favorite ? 1 : 0, JSON.stringify(task.dependencies ?? []),
    task.recentlyDeleted ? 1 : 0,
  ];
}

const TASK_COLUMNS = `
  id, title, description, category, priority, status, due_date, due_time,
  created_date, completed_date, estimated_duration, actual_duration, reminder,
  repeat_rule, notes, tags, attachments, color, pinned, favorite, dependencies, recently_deleted`;
const TASK_PLACEHOLDERS = new Array(22).fill('?').join(', ');

async function nativeDatabase() {
  if (!isTauriRuntime()) return null;
  return getDatabase();
}

export async function getAllTasks(): Promise<Task[]> {
  const database = await nativeDatabase();
  if (!database) return readFallback().sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  let rows = await database.select<TaskRow[]>(`SELECT ${TASK_COLUMNS} FROM tasks ORDER BY created_date DESC`);
  if (rows.length === 0 && !window.localStorage.getItem(SQLITE_MIGRATION_KEY)) {
    const legacyTasks = readFallback();
    for (const task of legacyTasks) {
      await database.execute(`INSERT OR IGNORE INTO tasks (${TASK_COLUMNS}) VALUES (${TASK_PLACEHOLDERS})`, values(task));
    }
    window.localStorage.setItem(SQLITE_MIGRATION_KEY, 'true');
    rows = await database.select<TaskRow[]>(`SELECT ${TASK_COLUMNS} FROM tasks ORDER BY created_date DESC`);
  }
  return rows.map(toTask);
}

export async function addTask(task: Task): Promise<void> {
  await persistTask(task, 'create');
}

export async function updateTask(task: Task): Promise<void> {
  await persistTask(task, 'update');
}

async function persistTask(task: Task, operation: 'create' | 'update'): Promise<void> {
  const database = await nativeDatabase();
  if (!database) {
    const tasks = readFallback();
    const index = tasks.findIndex((existing) => existing.id === task.id);
    if (operation === 'create') {
      if (index !== -1) throw new Error('A task with this id already exists.');
      writeFallback([...tasks, task]);
    } else {
      if (index === -1) throw new Error('The task no longer exists.');
      tasks[index] = task;
      writeFallback(tasks);
    }
    return;
  }

  if (operation === 'create') {
    await database.execute(`INSERT INTO tasks (${TASK_COLUMNS}) VALUES (${TASK_PLACEHOLDERS})`, values(task));
    return;
  }

  const existing = await database.select<{ id: string }[]>('SELECT id FROM tasks WHERE id = ? LIMIT 1', [task.id]);
  if (existing.length === 0) throw new Error('The task no longer exists.');
  await database.execute(
    `UPDATE tasks SET title=?, description=?, category=?, priority=?, status=?, due_date=?, due_time=?, created_date=?, completed_date=?, estimated_duration=?, actual_duration=?, reminder=?, repeat_rule=?, notes=?, tags=?, attachments=?, color=?, pinned=?, favorite=?, dependencies=?, recently_deleted=? WHERE id=?`,
    [...values(task).slice(1), task.id],
  );
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await getAllTasks();
  const task = tasks.find((item) => item.id === id);
  if (task) await updateTask({ ...task, recentlyDeleted: true });
}

export async function restoreTask(id: string): Promise<void> {
  const tasks = await getAllTasks();
  const task = tasks.find((item) => item.id === id);
  if (task) await updateTask({ ...task, recentlyDeleted: false });
}

export async function duplicateTask(task: Task): Promise<void> {
  await addTask({ ...task, id: crypto.randomUUID(), title: `${task.title} (Copy)`, createdDate: new Date().toISOString(), completedDate: undefined, recentlyDeleted: false });
}

export async function replaceAllTasks(tasks: Task[]): Promise<void> {
  const validTasks = tasks.filter(isTask);
  const database = await nativeDatabase();
  if (!database) return writeFallback(validTasks);
  await database.execute('BEGIN');
  try {
    await database.execute('DELETE FROM tasks');
    for (const task of validTasks) {
      await database.execute(`INSERT INTO tasks (${TASK_COLUMNS}) VALUES (${TASK_PLACEHOLDERS})`, values(task));
    }
    await database.execute('COMMIT');
  } catch (error) {
    await database.execute('ROLLBACK');
    throw error;
  }
}
