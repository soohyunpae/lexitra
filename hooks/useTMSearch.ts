

import { useState } from 'react';
import type { TMSearchResult } from '@/components/TMSearchPanel';

export function useTMSearch(sourceLang = 'ko', targetLang = 'en') {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/search_tm?query=${encodeURIComponent(query)}&sourceLang=${sourceLang}&targetLang=${targetLang}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setError('검색 결과 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('TM 검색 오류:', err);
      setError('검색 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  return {
    query, setQuery,
    results,
    loading,
    error,
    handleSearch,
  };
}