// /app/api/update-project/route.ts

import { prisma } from '../../../lib/prisma'; // Prisma import
import { NextResponse } from 'next/server'; // Next.js server response

export async function POST(req: Request) {
  try {
    // 요청으로부터 프로젝트 수정 정보 받기
    const { id, name, note } = await req.json();

    // Prisma를 통해 DB에서 프로젝트 수정
    const updatedProject = await prisma.project.update({
      where: { id: Number(id) }, // id를 통해 프로젝트 찾기
      data: { name, note }, // 수정할 데이터
    });

    // 수정된 프로젝트가 없으면 에러 반환
    if (!updatedProject) {
      return NextResponse.json({ error: 'Failed to update project' }, { status: 400 });
    }

    // 수정된 프로젝트 정보 반환
    return NextResponse.json(updatedProject, { status: 200 });

  } catch (error) {
    console.error('Error updating project:', error); // 에러 로그 출력
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}