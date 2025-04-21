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
    <div className="h-full overflow-y-auto p-4 border-l border-gray-300 dark:border-gray-700 w-80 bg-gray-50 dark:bg-black text-gray-800 dark:text-white">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">TM 검색</h2>
      </div>
      <div className="flex mb-4">
          <input
            type="text"
            className="flex-grow border border-gray-400 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring focus:border-blue-400 text-sm"
            placeholder="검색어를 입력하세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 ml-2 rounded disabled:opacity-50"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
          >
            검색
          </button>
      </div>
      {loading && <p className="text-sm text-gray-500 mb-2">검색 중...</p>}
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <div>
        {results.length > 0 ? (
          <ul className="space-y-3">
            {results.map((item, idx) => (
              <li key={idx} className="p-2 border rounded bg-white dark:bg-gray-900 shadow-sm">
                <p className="text-gray-800 dark:text-white text-sm mb-1">
                  <span className="font-semibold">원문: </span>
                  {item.source}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                  <span className="font-semibold">번역: </span>
                  {item.target}
                </p>
                {item.score !== undefined && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">유사도: {Math.round(item.score)}%</p>
                )}
                {item.status && (
                  <div className="mt-1">
                    <TMStatusBadge status={item.status} />
                  </div>
                )}
                <button
                  className="mt-1 w-full py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs text-gray-800 dark:text-white rounded"
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