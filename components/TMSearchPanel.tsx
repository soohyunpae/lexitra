'use client';

import React from 'react';
import { useTMSearch } from '@/hooks/useTMSearch';
import TMStatusBadge from './TMStatusBadge';

export interface TMSearchResult {
  source: string;
  target: string;
  sourceLang: string;
  targetLang: string;
  updatedAt: string;
  score?: number; // 유사도 점수 (선택사항)
  status?: string;
}

export interface TMSearchPanelProps {
  onSelect?: (result: TMSearchResult) => void;
  sourceLang?: string;
  targetLang?: string;
}

export default function TMSearchPanel({ onSelect, sourceLang = 'ko', targetLang = 'en' }: TMSearchPanelProps) {
  const {
    query, setQuery,
    results,
    loading,
    error,
    handleSearch,
  } = useTMSearch(sourceLang, targetLang);

  return (
    <div className="p-4 border-l border-gray-300 w-80 bg-gray-50">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">TM 검색</h2>
      </div>
      <div className="flex mb-4">
        <input
          type="text"
          className="flex-grow border border-gray-400 p-2 rounded focus:outline-none focus:ring focus:border-blue-400 text-sm"
          placeholder="검색어를 입력하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 ml-2 rounded"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          검색
        </button>
      </div>
      {loading && <p className="text-sm text-gray-500 mb-2">검색 중...</p>}
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <div className="overflow-y-auto max-h-80">
        {results.length > 0 ? (
          <ul className="space-y-3">
            {results.map((item, idx) => (
              <li key={idx} className="p-2 border rounded bg-white shadow-sm">
                <p className="text-gray-800 text-sm mb-1">
                  <span className="font-semibold">원문: </span>
                  {item.source}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  <span className="font-semibold">번역: </span>
                  {item.target}
                </p>
                {item.score !== undefined && (
                  <p className="text-xs text-gray-500">유사도: {Math.round(item.score)}%</p>
                )}
                {item.status && (
                  <div className="mt-1">
                    <TMStatusBadge status={item.status} />
                  </div>
                )}
                <button
                  className="mt-1 w-full py-1 bg-gray-200 hover:bg-gray-300 text-xs text-gray-800 rounded"
                  onClick={() => onSelect?.(item)}
                >
                  선택
                </button>
              </li>
            ))}
          </ul>
        ) : (
          !loading && !error && (
            <p className="text-sm text-gray-500">검색 결과가 없습니다.</p>
          )
        )}
      </div>
    </div>
  );
}