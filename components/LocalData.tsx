import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('localdata.db');

    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        DROP TABLE IF EXISTS Registration;

        CREATE TABLE Registration (
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
  const results = await db.getAllAsync<{ Reg: string }>(
    'SELECT Reg AS reg FROM Registration;'
  );
  return results.map(row => row.Reg);
}

export async function clearRegistrations(): Promise<void> {
  const db = await getDB();
  console.log("Attempting to clear...")

    await db.runAsync(`DELETE FROM Registration
                        WHERE id IN (
                        SELECT id
                        FROM Registration
                        ORDER BY id ASC
                        LIMIT 100
                      );
    `);
      

    console.log("Cleared.")

}
  
// export async function clearRegistrations(chunkSize: number): Promise<void> {
//   const db = await getDB();

//   await db.runAsync('DELETE FROM Registration;'); // Delete all.
//   }