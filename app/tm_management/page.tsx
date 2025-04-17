'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Modal from '../../components/Modal';
import TMEditForm from '../../components/TMEditForm';

// TM 데이터 인터페이스 선언
interface TMEntry {
  source: string;
  target: string;
  sourceLang: string;
  targetLang: string;
  updatedAt: string;
}

export default function TMManagementPage() {
  const [tmList, setTmList] = useState<TMEntry[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // 모달 관련 상태: 수정할 항목과 모달 열림 여부
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<TMEntry | null>(null);

  const fetchTMList = async () => {
    setLoading(true);
    setError('');
    try {
      let data = [];

      if (query.trim() === '') {
        const res = await fetch('/api/tm/list');
        data = await res.json();
      } else {
        const res = await fetch(
          `http://127.0.0.1:8000/search-tm?query=${encodeURIComponent(query)}&sourceLang=ko&targetLang=en`
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        data = await res.json();
      }

      const validData = Array.isArray(data)
        ? data.filter(
            (entry: any) =>
              entry.source && entry.target && entry.sourceLang && entry.targetLang
          )
        : [];

      setTmList(validData);
    } catch (err) {
      console.error('TM 목록 로드 오류:', err);
      setError('TM 목록 로드 실패');
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadInitialTM = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/tm/list');
        const data = await res.json();
        if (Array.isArray(data)) {
          setTmList(data);
        } else {
          console.error('[Initial TM Load] 응답 형식 오류:', data);
          setError('초기 TM 데이터를 불러오지 못했습니다.');
        }
      } catch (err) {
        console.error('[Initial TM Load] 오류:', err);
        setError('초기 TM 데이터를 불러오지 못했습니다.');
      }
      setLoading(false);
    };

    loadInitialTM();
  }, []);

  // 수정 버튼을 누르면 모달을 열고, 해당 항목을 설정합니다.
  const handleEdit = (item: TMEntry) => {
    setCurrentEditItem(item);
    setEditModalOpen(true);
  };

  // 모달에서 업데이트 후, 목록 새로고침을 위해 콜백 처리
  const handleUpdate = () => {
    setEditModalOpen(false);
    setCurrentEditItem(null);
    fetchTMList();
  };

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
      <ul className="space-y-3">
        {tmList.map((item, idx) => (
          <li key={idx} className="p-3 border rounded bg-gray-50">
            <p className="text-sm font-semibold text-gray-800">원문: {item.source}</p>
            <p className="text-sm text-gray-600">번역: {item.target}</p>
            <p className="text-xs text-gray-500">
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

      {/* TM 편집 모달 */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        {currentEditItem && (
          <TMEditForm
            initialSource={currentEditItem.source}
            initialTarget={currentEditItem.target}
            onUpdate={handleUpdate}
          />
        )}
      </Modal>
    </div>
  );
}
