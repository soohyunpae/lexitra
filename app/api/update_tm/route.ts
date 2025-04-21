import type { TmEntry } from '@/lib/types';
import { NextResponse } from 'next/server';
import { upsertTmEntry } from '@/lib/tmUtils';

// ✅ 유니코드 정규화 + 공백 정리 함수
function normalizeText(s: string): string {
  return s
    .normalize('NFC')         // 유니코드 정규화
    .trim()                   // 앞뒤 공백 제거
    .replace(/\s+/g, ' ');    // 연속된 공백을 하나로
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request Body:', body);
    console.log('🧾 업데이트 요청 전체:', body);

    const {
      source,
      target,
      sourceLang,
      targetLang,
      status = 'Approved',
      comment = '',
    } = body;

    console.log('📦 status 확인:', status);

    if (!source || !target || !sourceLang || !targetLang) {
      return NextResponse.json({ message: '필수 필드 누락' }, { status: 400 });
    }

    const normalizedPayload = {
      source: normalizeText(source),
      sourceLang: normalizeText(sourceLang),
      targetLang: normalizeText(targetLang),
      target: normalizeText(target),
      status,
      comment: normalizeText(comment),
      updatedAt: new Date(),
    };

    console.log('📤 TM 업데이트 전송:', normalizedPayload);

    await upsertTmEntry(normalizedPayload as TmEntry); 

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('TM 업데이트 오류:', error);
    return NextResponse.json({ message: 'TM 업데이트 실패' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}