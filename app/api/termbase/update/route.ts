

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { id, term, definition, note } = await req.json();
    if (!id) return NextResponse.json({ status: 'error', message: 'ID 없음' }, { status: 400 });

    await prisma.termbaseEntry.update({
      where: { id },
      data: {
        term: term || '',
        definition: definition || '',
        note: note || '',
      },
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('수정 실패:', error);
    return NextResponse.json({ status: 'error', message: '서버 오류' }, { status: 500 });
  }
}