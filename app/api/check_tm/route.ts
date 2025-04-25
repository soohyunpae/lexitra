import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import stringSimilarity from 'string-similarity';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = (searchParams.get('text') || '').trim();
  const sourceLang = searchParams.get('sourceLang') || 'ko';
  const targetLang = searchParams.get('targetLang') || 'en';

  if (!text) {
    return NextResponse.json({ source: '', target: '', score: 0 });
  }

  try {
    const entries = await prisma.translationMemory.findMany({
      where: {
        sourceLang,
        targetLang,
      },
      select: {
        source: true,
        target: true,
      },
    });

    if (!entries || entries.length === 0) {
      return NextResponse.json({ source: text, target: '', score: 0 });
    }

    const candidates = entries.map(entry => entry.source);
    const { bestMatch, bestMatchIndex } = stringSimilarity.findBestMatch(text, candidates);

    const score = Math.round(bestMatch.rating * 100);
    if (score >= 70) {
      return NextResponse.json({
        source: entries[bestMatchIndex].source,
        target: entries[bestMatchIndex].target,
        score,
      });
    } else {
      return NextResponse.json({ source: text, target: '', score: 0 });
    }
  } catch (error) {
    console.error('[check_tm] 유사도 검색 오류:', error);
    return NextResponse.json({ error: 'check_tm 실패' }, { status: 500 });
  }
}