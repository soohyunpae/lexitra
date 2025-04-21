'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import TMStatusBadge from '@/components/TMStatusBadge';
// Removed unused Modal and TMEditForm imports
import { useTMSearch } from '@/hooks/useTMSearch';

// TM 데이터 인터페이스 선언
interface TMEntry {
  source: string;
  target: string;
  sourceLang: string;
  targetLang: string;
  updatedAt: string;
  comment?: string;
  status?: string;
}

export default function TMManagementPage() {
  const {
    query,
    setQuery,
    results: tmList,
    loading,
    error,
    handleSearch: fetchTMList,
  } = useTMSearch('ko', 'en');
  // 모달 관련 상태: 수정할 항목과 모달 열림 여부
  // Removed modal related state

  // 수정 버튼을 누르면 새 창에서 편집 페이지를 엽니다.
  const handleEdit = (item: TMEntry) => {
    const query = new URLSearchParams({
      source: item.source,
      target: item.target,
      sourceLang: item.sourceLang,
      targetLang: item.targetLang,
      status: item.status || '',
      comment: item.comment || '',
    }).toString();

    window.open(`/tm_management/edit?${query}`, '_blank', 'width=600,height=600');
  };

  // Removed unused handleUpdate function

  // 삭제 기능 예시
  const handleDelete = async (item: TMEntry) => {
    try {
      const res = await fetch('/api/delete_tm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          source: item.source, 
          sourceLang: item.sourceLang, 
          targetLang: item.targetLang 
        }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        fetchTMList();
      }
    } catch (err) {
      console.error('TM 삭제 오류:', err);
    }
  };
  
  const [newSource, setNewSource] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState('MT');
  
  const handleAddTM = async () => {
    try {
      const res = await fetch('/api/tm/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: newSource,
          target: newTarget,
          sourceLang: 'ko',
          targetLang: 'en',
          comment: newComment,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        fetchTMList();
        setNewSource('');
        setNewTarget('');
        setNewComment('');
      }
    } catch (err) {
      console.error('TM 추가 오류:', err);
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">TM 관리</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border p-2 flex-grow rounded"
          placeholder="검색어를 입력하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={fetchTMList}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          검색
        </button>
      </div>
      <button
        onClick={fetchTMList}
        className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
      >
        새로고침
      </button>
      {loading && <p className="text-sm text-gray-500">로딩 중...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-6 border rounded p-4 bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-2">TM 수동 등록</h2>
        <input
          type="text"
          value={newSource}
          onChange={(e) => setNewSource(e.target.value)}
          placeholder="원문"
          className="border p-2 rounded w-full mb-2"
        />
        <input
          type="text"
          value={newTarget}
          onChange={(e) => setNewTarget(e.target.value)}
          placeholder="번역문"
          className="border p-2 rounded w-full mb-2"
        />
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="코멘트 (선택)"
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={handleAddTM}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          등록
        </button>
      </div>
      <ul className="space-y-3">
        {tmList.map((item, idx) => (
          <li key={idx} className="p-3 border rounded bg-gray-50">
            <p className="text-sm font-semibold text-gray-800">원문: {item.source}</p>
            <p className="text-sm text-gray-600">번역: {item.target}</p>
            {item.status && (
              <div className="mt-1">
                <TMStatusBadge status={item.status} />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {item.sourceLang} → {item.targetLang} / {item.updatedAt}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEdit(item)}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(item)}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
        {tmList.length === 0 && !loading && !error && (
          <p className="text-sm text-gray-500">등록된 TM이 없습니다.</p>
        )}
      </ul>

      {/* Removed Modal section as editing is handled in a popup window */}
    </div>
  );
}
