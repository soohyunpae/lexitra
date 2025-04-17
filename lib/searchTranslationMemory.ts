export async function searchTranslationMemory(
  query: string,
  sourceLang: string,
  targetLang: string
): Promise<any[]> {
  const url = `http://127.0.0.1:8000/search-tm?query=${encodeURIComponent(query)}&sourceLang=${sourceLang}&targetLang=${targetLang}`;
  console.log('[search-tm] 요청 URL:', url);

  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    console.error('[search-tm] 응답 에러 상태:', response.status, text);
    throw new Error(`FastAPI 요청 실패: ${response.status}`);
  }

  const data = await response.json();
  console.log('[search-tm] 응답 데이터:', data);
  return data;
}