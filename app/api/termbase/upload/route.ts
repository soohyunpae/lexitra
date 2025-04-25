import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parse } from 'csv-parse/sync';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ status: 'error', message: '파일이 없습니다.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const csvText = buffer.toString('utf-8');

  try {
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    });

    const created = await prisma.$transaction(
      records.map((row: any) =>
        prisma.termbaseEntry.create({
          data: {
            term: row.term || '',
            definition: row.definition || '',
            note: row.note || '',
          },
        })
      )
    );

    return NextResponse.json({ status: 'ok', count: created.length });
  } catch (error) {
    console.error('CSV 파싱 또는 DB 저장 실패:', error);
    return NextResponse.json({ status: 'error', message: 'CSV 처리 실패' }, { status: 500 });
  }
}