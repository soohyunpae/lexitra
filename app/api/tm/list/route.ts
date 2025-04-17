import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tmList = await prisma.TranslationMemory.findMany({
      orderBy: { updatedAt: 'desc' }, // 최근 수정된 순서대로 정렬
    });
    return NextResponse.json(tmList);
  } catch (error) {
    console.error('TM 리스트 로딩 오류:', error);
    return NextResponse.json({ message: 'TM 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}