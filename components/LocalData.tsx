import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('localdata.db');

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS Registration (
        Reg TEXT PRIMARY KEY NOT NULL
      );
    `);
  }

  return db;
}