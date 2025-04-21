

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const parsedId = parseInt(id);
    if (!parsedId || isNaN(parsedId)) {
      return NextResponse.json({ status: 'error', message: '올바르지 않은 ID' }, { status: 400 });
    }

    await prisma.termbaseEntry.delete({
      where: { id: parsedId },
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('삭제 실패:', error);
    return NextResponse.json({ status: 'error', message: '서버 오류' }, { status: 500 });
  }
}