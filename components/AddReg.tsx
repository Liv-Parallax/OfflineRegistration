import { getDB } from './LocalData';

export async function addRegistration(reg: string): Promise<void> {
  if (!reg || !reg.trim()) return; // 🚨 prevent crash

  const normalized = reg.replace(/\s+/g, '').toUpperCase();
  const db = await getDB();

  await db.runAsync(
    'INSERT OR IGNORE INTO Registration (Reg) VALUES (?);',
    [normalized]
  );
}