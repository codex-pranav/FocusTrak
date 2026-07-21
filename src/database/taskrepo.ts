import { Task } from "../types";

/**
 * Tasks are kept in localStorage so the web build works without Tauri.  The
 * repository remains asynchronous to keep the UI independent from its storage
 * implementation (a native database can be added later without changing views).
 */
const STORAGE_KEY = "productivity.tasks.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readTasks(): Task[] {
  if (!isBrowser()) return [];

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isTask) : [];
  } catch {
    // A corrupt saved value must never prevent the workspace from loading.
    return [];
  }
}

function writeTasks(tasks: Task[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false;
  const task = value as Partial<Task>;
  return typeof task.id === "string" && typeof task.title === "string" &&
    typeof task.createdDate === "string";
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getAllTasks(): Promise<Task[]> {
  return readTasks().sort((left, right) => right.createdDate.localeCompare(left.createdDate));
}

export async function addTask(task: Task): Promise<void> {
  const tasks = readTasks();
  if (tasks.some((existing) => existing.id === task.id)) {
    throw new Error("A task with this id already exists.");
  }
  writeTasks([...tasks, task]);
}

export async function updateTask(task: Task): Promise<void> {
  const tasks = readTasks();
  const index = tasks.findIndex((existing) => existing.id === task.id);
  if (index === -1) throw new Error("The task no longer exists.");
  tasks[index] = task;
  writeTasks(tasks);
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = readTasks();
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  writeTasks(tasks.map((item) => item.id === id ? { ...item, recentlyDeleted: true } : item));
}

export async function restoreTask(id: string): Promise<void> {
  const tasks = readTasks();
  writeTasks(tasks.map((item) => item.id === id ? { ...item, recentlyDeleted: false } : item));
}

export async function duplicateTask(task: Task): Promise<void> {
  await addTask({
    ...task,
    id: newId(),
    title: `${task.title} (Copy)`,
    createdDate: new Date().toISOString(),
    completedDate: undefined,
    recentlyDeleted: false,
  });
}

export async function replaceAllTasks(tasks: Task[]): Promise<void> {
  writeTasks(tasks.filter(isTask));
}
