import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { term, definition, note } = await req.json();

    const created = await prisma.termbaseEntry.create({
      data: {
        term,
        definition,
        note,
      },
    });

    return NextResponse.json({ status: 'ok', data: created });
  } catch (error) {
    console.error('용어집 등록 실패:', error);
    return NextResponse.json({ status: 'error', message: '용어집 등록 실패' }, { status: 500 });
  }
}
