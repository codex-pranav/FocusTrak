export enum Priority {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum Status {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  ARCHIVED = 'Archived'
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string; // references Category name or id
  priority: Priority;
  status: Status;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:MM
  createdDate: string;
  completedDate?: string;
  estimatedDuration: number; // in minutes
  actualDuration: number; // in minutes
  reminder: string; // 'none', '5min', '15min', '30min', '1hr', '1day'
  repeat: string; // 'none', 'daily', 'weekly', 'monthly'
  notes: string;
  tags: string[];
  attachments: string[]; // Mock file names/URIs
  color: string;
  pinned: boolean;
  favorite: boolean;
  dependencies?: string[]; // IDs of tasks that must be completed first
  recentlyDeleted?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown / Plain text
  isChecklist: boolean;
  checklistItems: { id: string; text: string; completed: boolean }[];
  taskLinkId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  history: { [date: string]: boolean }; // YYYY-MM-DD -> completed
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
  color: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  accentColor: string; // hex code or tailwind name
  fontSize: 'sm' | 'md' | 'lg';
  notificationsEnabled: boolean;
  shortcutsEnabled: boolean;
  autoBackup: boolean;
  userName?: string;
  suiteName?: string;
}
