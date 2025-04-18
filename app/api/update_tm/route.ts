import { NextResponse } from 'next/server';

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
    
    if (!body.status) {
      body.status = 'Approved';
    }
    body.status = normalizeText(body.status);

    const apiRes = await fetch('http://127.0.0.1:8000/update-tm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entries: [body] }),
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      console.error('FastAPI 응답 오류:', text);
      return NextResponse.json({ message: 'TM 업데이트 실패' }, { status: 500 });
    }

    const data = await apiRes.json();
    return NextResponse.json({ status: 'ok', data });

  } catch (error) {
    console.error('TM 업데이트 프록시 오류:', error);
    return NextResponse.json({ message: 'TM 업데이트 실패' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}