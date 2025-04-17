import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const projects = await prisma.project.findMany() // 프로젝트 목록 가져오기
    return NextResponse.json(projects)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { name, note } = await req.json()
  try {
    const newProject = await prisma.project.create({
      data: {
        name,
        note,
      },
    })
    return NextResponse.json(newProject)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}