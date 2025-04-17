import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text') || '';
    const sourceLang = searchParams.get('sourceLang') || 'ko';
    const targetLang = searchParams.get('targetLang') || 'en';

    const url = `http://127.0.0.1:8000/search-tm?query=${encodeURIComponent(text)}&sourceLang=${sourceLang}&targetLang=${targetLang}`;
    console.log('[check-tm] 요청 URL:', url);

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('[check-tm] 오류:', error);
    return NextResponse.json({ error: 'FastAPI 연동 오류' }, { status: 500 });
  }
}