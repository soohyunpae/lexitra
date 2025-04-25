import fs from 'fs'
import path from 'path'
import type { TmEntry } from './types';

const TM_FILE_PATH = path.resolve(process.cwd(), 'data', 'tm.json')

export function saveToTM(entry: TmEntry) {
  const tm: TmEntry[] = fs.existsSync(TM_FILE_PATH)
    ? JSON.parse(fs.readFileSync(TM_FILE_PATH, 'utf-8'))
    : []

  const exists = tm.find(
    (e) =>
      e.source === entry.source &&
      e.sourceLang === entry.sourceLang &&
      e.targetLang === entry.targetLang
  )

  if (exists) {
    exists.target = entry.target
    exists.updatedAt = new Date().toISOString()
  } else {
    tm.push({ ...entry, status: entry.status || 'MT', updatedAt: new Date().toISOString() })
  }

  fs.mkdirSync(path.dirname(TM_FILE_PATH), { recursive: true })
  fs.writeFileSync(TM_FILE_PATH, JSON.stringify(tm, null, 2), 'utf-8')
}

export function lookupFromTM(source: string, sourceLang: string, targetLang: string): TMMatch | null {
  if (!fs.existsSync(TM_FILE_PATH)) return null;

  const tm: TmEntry[] = JSON.parse(fs.readFileSync(TM_FILE_PATH, 'utf-8'));

  const match = tm.find(
    (e) =>
      e.source === source &&
      e.sourceLang === sourceLang &&
      e.targetLang === targetLang
  );

  if (!match) return null;

  return {
    target: match.target,
    score: 100,
  };
}
export type TMMatch = {
  target: string;
  score: number;
};