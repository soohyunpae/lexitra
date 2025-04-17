'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function TMEditPage() {
  const searchParams = useSearchParams();

  // Retrieve query parameters
  const initialSource = searchParams.get('source') || '';
  const initialTarget = searchParams.get('target') || '';

  const [source, setSource] = useState(initialSource);
  const [target, setTarget] = useState(initialTarget);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/update-tm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source, // Original text
          target, // Translated text
          sourceLang: 'ko', // Source language
          targetLang: 'en', // Target language
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || '수정 저장에 실패했습니다.');
      }

      if (window.opener) {
        window.opener.location.reload();
      }
      window.close();
    } catch (err) {
      console.error('수정 저장 오류:', err);
      setError('수정 저장 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">TM 수정</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">원문</label>
        <textarea
          className="w-full border rounded p-2"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">번역</label>
        <textarea
          className="w-full border rounded p-2"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
      </div>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={loading}
      >
        {loading ? '저장 중...' : '저장'}
      </button>
      <button
        onClick={() => window.close()}
        className="ml-2 px-4 py-2 bg-gray-600 text-white rounded"
      >
        취소
      </button>
    </div>
  );
}