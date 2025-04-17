export async function searchTM(query: string, sourceLang = 'ko', targetLang = 'en') {
    const url = `http://127.0.0.1:8000/search-tm?query=${encodeURIComponent(query)}&sourceLang=${sourceLang}&targetLang=${targetLang}`;
    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error(`TM 검색 실패: ${response.status}`);
    }
  
    return response.json();
  }