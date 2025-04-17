import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const filePath = path.resolve(__dirname, '../data/tm.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const entries = JSON.parse(raw)

  for (const entry of entries) {
    await prisma.tMEntry.upsert({
      where: {
        source_target_sourceLang_targetLang: {
          source: entry.source,
          target: entry.target,
          sourceLang: entry.sourceLang,
          targetLang: entry.targetLang,
        },
      },
      update: {
        updatedAt: new Date(entry.updatedAt || Date.now()),
        comment: entry.comment || null,
        note: entry.note || null,
        projectName: entry.projectName || null,
      },
      create: {
        source: entry.source,
        target: entry.target,
        sourceLang: entry.sourceLang,
        targetLang: entry.targetLang,
        updatedAt: new Date(entry.updatedAt || Date.now()),
        comment: entry.comment || null,
        note: entry.note || null,
        projectName: entry.projectName || null,
      },
    })
  }

  console.log(`✅ ${entries.length}개 항목이 DB에 반영되었습니다.`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})