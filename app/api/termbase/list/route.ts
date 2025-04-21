

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.termbaseEntry.findMany({
      orderBy: { id: 'desc' },
    });
    return NextResponse.json({ status: 'ok', items });
  } catch (error) {
    console.error('용어집 목록 불러오기 실패:', error);
    return NextResponse.json({ status: 'error', message: '불러오기 실패' }, { status: 500 });
  }
}