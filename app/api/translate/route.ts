import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, sourceLang, targetLang } = await request.json();
    const endpoint = process.env.PYTHON_TRANSLATION_ENDPOINT || 'http://127.0.0.1:8000/translate';

    console.log('[translate] 요청 본문:', { text, sourceLang, targetLang });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLang, targetLang }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[translate] 응답 에러 상태:', response.status, text);
      return NextResponse.json({ error: 'Translation backend error' }, { status: 500 });
    }

    const data = await response.json();
    console.log('[translate] 응답 데이터:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('프록시 API 에러:', error);
    return NextResponse.json({ error: 'Translation error' }, { status: 500 });
  }
}