import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? undefined;
  const take = parseInt(searchParams.get('take') || '100', 10);
  const skip = parseInt(searchParams.get('skip') || '0', 10);

  try {
    const tmList = await prisma.translationMemory.findMany({
      where: status ? { status } : undefined,
      orderBy: { updatedAt: 'desc' },
      take,
      skip,
    });
    return NextResponse.json(tmList);
  } catch (error) {
    console.error('TM 리스트 로딩 오류:', error);
    return NextResponse.json({ message: 'TM 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}