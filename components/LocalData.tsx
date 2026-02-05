import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('localdata.db');

    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS Registration (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          Reg TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
  }
  return db;
}

export async function addRegistration(reg: string): Promise<void> {
  if (!reg || !reg.trim()) return;

  const db = await getDB();
  const normalized = reg.replace(/\s+/g, '').toUpperCase();

  await db.runAsync(
    'INSERT OR IGNORE INTO Registration (Reg) VALUES (?);',
    [normalized]
  );
}

export async function getAllRegistrations(): Promise<string[]> {
  const db = await getDB();
  const results = await db.getAllAsync<{ reg: string }>(
    'SELECT Reg AS reg FROM Registration ORDER BY id ASC;'
  );
  return results.map(row => row.reg);
}

// Fetch a chunk of registrations with their DB ids. Use this for sending + chunk-based deletes.
export async function getRegistrations(limit = 1000): Promise<{ id: number; reg: string }[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<{ id: number; reg: string }>(
    'SELECT id, Reg AS reg FROM Registration ORDER BY id ASC LIMIT ?;',
    [limit]
  );
  return rows.map(r => ({ id: Number((r as any).id), reg: r.reg }));
}

// Delete specific registration rows by id (only those acknowledged by server)
export async function deleteRegistrationsByIds(ids: number[]): Promise<void> {
  if (!ids || ids.length === 0) return;
  const db = await getDB();
  const placeholders = ids.map(() => '?').join(',');
  console.log("deleting: " + ids)
  await db.runAsync(`DELETE FROM Registration WHERE id IN (${placeholders});`, ids);
}
  
export async function clearRegistrations(chunkSize: number): Promise<void> {
  const db = await getDB();

  await db.runAsync('DELETE FROM Registration;'); // Delete all.
}