import { getDatabase } from "./db";

export async function getAllTasks() {
  const db = await getDatabase();

  return await db.select(`
    SELECT *
    FROM tasks
    ORDER BY id DESC
  `);
}

export async function addTask(title: string) {
  const db = await getDatabase();

  await db.execute(
    `
    INSERT INTO tasks (title, completed, created_at)
    VALUES (?, ?, ?)
    `,
    [title, 0, new Date().toISOString()]
  );
}

export async function toggleTask(id: number, completed: number) {
  const db = await getDatabase();

  await db.execute(
    `
    UPDATE tasks
    SET completed = ?
    WHERE id = ?
    `,
    [completed, id]
  );
}

export async function deleteTask(id: number) {
  const db = await getDatabase();

  await db.execute(
    `
    DELETE FROM tasks
    WHERE id = ?
    `,
    [id]
  );
}