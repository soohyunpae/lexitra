import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { source, target, sourceLang, targetLang, comment, status } = await req.json();

    const created = await prisma.translationMemory.create({
      data: {
        source,
        target,
        sourceLang,
        targetLang,
        comment,
        status,
      },
    });

    return NextResponse.json({ status: 'ok', data: created });
  } catch (error) {
    console.error('TM 추가 실패:', error);
    return NextResponse.json({ status: 'error', message: 'TM 추가 실패' }, { status: 500 });
  }
}