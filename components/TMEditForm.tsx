'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TMEditFormProps {
  initialSource: string;
  initialTarget: string;
  initialComment?: string;
  initialStatus?: string;
  onUpdate: () => void;
}

export default function TMEditForm({ initialSource, initialTarget, initialComment, initialStatus, onUpdate }: TMEditFormProps) {
  const router = useRouter();
  const [target, setTarget] = useState(initialTarget);
  const [comment, setComment] = useState(initialComment || '');
  const [status, setStatus] = useState(initialStatus || 'MT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/update_tm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: initialSource,
          target,
          comment,
          status,
          sourceLang: 'ko',
          targetLang: 'en',
        }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        onUpdate();
      } else {
        setError('업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('업데이트 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">원문</label>
        <input
          type="text"
          value={initialSource}
          disabled
          className="w-full border p-2 rounded bg-gray-200 text-sm"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">번역</label>
        <textarea
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full border p-2 rounded text-sm"
          rows={4}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">코멘트</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border p-2 rounded text-sm"
          rows={2}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">상태</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border p-2 rounded text-sm"
        >
          <option value="MT">MT (Machine Translated)</option>
          <option value="Fuzzy">Fuzzy Match</option>
          <option value="Exact">Exact Match</option>
          <option value="Approved">Approved</option>
        </select>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
        disabled={loading}
      >
        {loading ? '업데이트 중...' : '업데이트'}
      </button>
    </form>
  );
}