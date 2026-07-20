import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

export async function getDatabase() {
  if (db) {
    return db;
  }

  db = await Database.load("sqlite:productivity.db");

  return db;
}