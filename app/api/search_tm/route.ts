import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const sourceLang = searchParams.get('sourceLang') || 'ko';
    const targetLang = searchParams.get('targetLang') || 'en';

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const results = await prisma.translationMemory.findMany({
      where: {
        source: {
          contains: query,
        },
        sourceLang,
        targetLang,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('[search-tm] Prisma 기반 검색 오류:', error);
    return NextResponse.json({ error: 'TM 검색 실패' }, { status: 500 });
  }
}