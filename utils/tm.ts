import fs from 'fs'
import path from 'path'

export type TMEntry = {
  source: string
  target: string
  sourceLang: string
  targetLang: string
  updatedAt: string
}

const TM_FILE_PATH = path.resolve(process.cwd(), 'data', 'tm.json')

export function saveToTM(entry: TMEntry) {
  const tm: TMEntry[] = fs.existsSync(TM_FILE_PATH)
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
    tm.push({ ...entry, updatedAt: new Date().toISOString() })
  }

  fs.mkdirSync(path.dirname(TM_FILE_PATH), { recursive: true })
  fs.writeFileSync(TM_FILE_PATH, JSON.stringify(tm, null, 2), 'utf-8')
}

export function lookupFromTM(source: string, sourceLang: string, targetLang: string): string | null {
  if (!fs.existsSync(TM_FILE_PATH)) return null

  const tm: TMEntry[] = JSON.parse(fs.readFileSync(TM_FILE_PATH, 'utf-8'))

  const match = tm.find(
    (e) =>
      e.source === source &&
      e.sourceLang === sourceLang &&
      e.targetLang === targetLang
  )

  return match?.target || null
}