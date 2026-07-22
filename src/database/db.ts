import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;
let dbPromise: Promise<Database> | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) return db;
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const database = await Database.load('sqlite:productivity.db');
    await database.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,

      title TEXT NOT NULL,
      description TEXT,

      category TEXT,

      priority TEXT,

      status TEXT,

      due_date TEXT,
      due_time TEXT,

      created_date TEXT NOT NULL,
      completed_date TEXT,

      estimated_duration INTEGER,
      actual_duration INTEGER,

      reminder TEXT,
      repeat_rule TEXT,

      notes TEXT,

      tags TEXT,

      attachments TEXT,

      color TEXT,

      pinned INTEGER DEFAULT 0,

      favorite INTEGER DEFAULT 0,

      dependencies TEXT,

      recently_deleted INTEGER DEFAULT 0
    );
    `);
    db = database;
    return database;
  })();

  try {
    return await dbPromise;
  } catch (error) {
    dbPromise = null;
    throw error;
  }
}
