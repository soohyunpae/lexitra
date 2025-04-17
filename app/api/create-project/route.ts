// app/api/create-project/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, note } = await req.json()

    // 새 프로젝트 생성
    const newProject = await prisma.project.create({
      data: {
        name,
        note,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(newProject)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: '프로젝트 생성 실패' }, { status: 500 })
  }
}