import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const sourceLang = searchParams.get('sourceLang') || 'ko';
    const targetLang = searchParams.get('targetLang') || 'en';

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const endpoint = process.env.PYTHON_SEARCH_TM_ENDPOINT || 'http://127.0.0.1:8000/search-tm';
    const fullUrl = `${endpoint}?query=${encodeURIComponent(query)}&sourceLang=${sourceLang}&targetLang=${targetLang}`;
    console.log('[search-tm] 요청 URL:', fullUrl);

    const response = await fetch(fullUrl);
    const text = await response.text();

    if (!response.ok) {
      console.error('[search-tm] 응답 에러 상태:', response.status, text);
      return NextResponse.json({ error: 'FastAPI 서버 응답 오류', status: response.status }, { status: 502 });
    }

    try {
      const data = JSON.parse(text);
      console.log('[search-tm] 응답 데이터:', data);
      return NextResponse.json(data);
    } catch (parseErr) {
      console.error('[search-tm] JSON 파싱 실패:', parseErr, text);
      return NextResponse.json({ error: '응답 JSON 파싱 오류' }, { status: 502 });
    }
  } catch (error) {
    console.error('[search-tm] TM 검색 프록시 에러:', error);
    return NextResponse.json({ error: 'TM 검색 실패' }, { status: 500 });
  }
}