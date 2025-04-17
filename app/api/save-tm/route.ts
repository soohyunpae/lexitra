import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const entries = await req.json()

    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    const created = await Promise.all(
      entries.map((entry) =>
        prisma.translationMemory.create({
          data: {
            source: entry.source,
            target: entry.target,
            sourceLang: entry.sourceLang,
            targetLang: entry.targetLang,
            projectName: entry.projectName || null,
            note: entry.note || null,
            comment: entry.comment || null,
          },
        })
      )
    )

    return NextResponse.json({ count: created.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}