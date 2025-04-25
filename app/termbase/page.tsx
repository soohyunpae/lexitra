'use client';

import { useState, useEffect } from 'react';

export default function TermbasePage() {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [note, setNote] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [terms, setTerms] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTerm, setEditTerm] = useState('');
  const [editDefinition, setEditDefinition] = useState('');
  const [editNote, setEditNote] = useState('');

  const handleAddTerm = async () => {
    try {
      const res = await fetch('/api/termbase/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term, definition, note }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setTerm('');
        setDefinition('');
        setNote('');
        alert('용어가 등록되었습니다.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('용어 등록 실패:', err.message);
      }
    }
  };
  
  const handleUploadCSV = async () => {
    if (!csvFile) return;
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await fetch('/api/termbase/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'ok') {
        alert('용어집이 업로드되었습니다.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('CSV 업로드 실패:', err.message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 용어를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch('/api/termbase/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setTerms(terms.filter((t) => t.id !== id));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('삭제 실패:', err.message);
      }
    }
  };

  const handleUpdate = async () => {
    if (editingId === null) return;
    try {
      const res = await fetch('/api/termbase/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          term: editTerm,
          definition: editDefinition,
          note: editNote,
        }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setTerms(
          terms.map((item) =>
            item.id === editingId
              ? { ...item, term: editTerm, definition: editDefinition, note: editNote }
              : item
          )
        );
        setEditingId(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('수정 실패:', err.message);
      }
    }
  };

  useEffect(() => {
    fetch('/api/termbase/list')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setTerms(data.items);
      });
  }, []);

  return (
    <div className="w-full h-full p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Term List */}
        <div className="md:w-2/3 w-full border rounded p-4 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-semibold mb-2">용어집 목록</h2>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 p-2 border rounded w-full"
          />
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border p-2">용어</th>
                <th className="border p-2">번역어</th>
                <th className="border p-2">비고</th>
                <th className="border p-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {terms
                .filter((item) =>
                  [item.term, item.definition, item.note]
                    .join(' ')
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="border p-2">
                      {editingId === item.id ? (
                        <input
                          value={editTerm}
                          onChange={(e) => setEditTerm(e.target.value)}
                          className="w-full border p-1"
                        />
                      ) : (
                        item.term
                      )}
                    </td>
                    <td className="border p-2">
                      {editingId === item.id ? (
                        <input
                          value={editDefinition}
                          onChange={(e) => setEditDefinition(e.target.value)}
                          className="w-full border p-1"
                        />
                      ) : (
                        item.definition
                      )}
                    </td>
                    <td className="border p-2">
                      {editingId === item.id ? (
                        <input
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          className="w-full border p-1"
                        />
                      ) : (
                        item.note
                      )}
                    </td>
                    <td className="border p-2 text-center space-x-2">
                      {editingId === item.id ? (
                        <>
                          <button
                            onClick={handleUpdate}
                            className="text-green-600 hover:underline text-sm"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-500 hover:underline text-sm"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditTerm(item.term);
                              setEditDefinition(item.definition);
                              setEditNote(item.note);
                            }}
                            className="text-blue-500 hover:underline text-sm"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:underline text-sm"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Right: Forms */}
        <div className="md:w-1/3 w-full flex flex-col gap-6">
          <div className="border rounded p-4 bg-white dark:bg-gray-900">
            <h2 className="text-lg font-semibold mb-2">용어 수동 등록</h2>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="용어"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="번역어 / 정의"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="비고 (선택)"
              className="w-full mb-4 p-2 border rounded"
            />
            <button
              onClick={handleAddTerm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
            >
              등록
            </button>
          </div>

          <div className="border rounded p-4 bg-white dark:bg-gray-900">
            <h2 className="text-lg font-semibold mb-2">CSV 파일 업로드</h2>
            <div className="flex items-center gap-2 mb-4">
              <label
                htmlFor="csv-upload"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded cursor-pointer hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                파일 선택
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {csvFile ? csvFile.name : '선택된 파일 없음'}
              </span>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
            <button
              onClick={handleUploadCSV}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
            >
              업로드
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}