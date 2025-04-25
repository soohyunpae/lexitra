'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TMStatusBadge from '@/components/TMStatusBadge';

interface TranslationUnit {
  id: number;
  source: string;
  target: string;
  status: string;
}

export default function FileEditPage() {
  const { projectId, fileId } = useParams();
  const fileIdNumber = Number(fileId);
  const [units, setUnits] = useState<TranslationUnit[]>([]);

  useEffect(() => {
    const loadUnits = async () => {
      const res = await fetch(`/api/project/${projectId}/file/${fileId}/units`);
      let fetchedUnits: TranslationUnit[] = await res.json();

      if (fetchedUnits.length === 0) {
        console.log('⚙️ No units found, initializing...');
        const checkRes = await fetch(`/api/project/${projectId}/file/${fileId}`);
        const fileInfo = await checkRes.json();

        if (!fileInfo.isInitialized) {
          await fetch(`/api/project/${projectId}/file/${fileId}/initialize`, {
            method: 'POST',
          });

          // Add a short delay before fetching again
          await new Promise((resolve) => setTimeout(resolve, 500));

          const retryRes = await fetch(`/api/project/${projectId}/file/${fileId}/units`);
          fetchedUnits = await retryRes.json();
        } else {
          console.log('⚠️ File already initialized, skipping initialization.');
        }
      }

      const updatedUnits = await Promise.all(
        fetchedUnits.map(async (u) => {
          if (!u.target) {
            try {
              const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source: u.source }),
              });
              const { translation } = await res.json();
              return { ...u, target: translation, status: 'MT' };
            } catch (err) {
              console.error('Translation error:', err);
              return u;
            }
          }
          return u;
        })
      );

      setUnits(updatedUnits);
    };

    loadUnits();
  }, [projectId, fileId]);

  const handleChange = (id: number, value: string) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === id ? { ...u, target: value } : u))
    );
  };

  const handleSave = async (id: number) => {
    const unit = units.find((u) => u.id === id);
    if (!unit) return;
    await fetch(`/api/tm/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: unit.id,
        target: unit.target,
        status: 'Reviewed',
      }),
    });
    alert('저장 완료!');
  };

  const handleDownloadSource = () => {
    const content = units.map((u) => u.source).join('\n');
    downloadTextFile(content, `source-file-${fileIdNumber}.txt`);
  };

  const handleDownloadTarget = () => {
    const content = units.map((u) => u.target).join('\n');
    downloadTextFile(content, `translated-file-${fileIdNumber}.txt`);
  };

  const downloadTextFile = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleDownloadSource}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
        >
          원문 다운로드
        </button>
        <button
          onClick={handleDownloadTarget}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
        >
          번역문 다운로드
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">파일 내 번역 결과</h1>
      {units.length === 0 && (
        <p className="text-gray-400">번역할 문장이 없습니다.</p>
      )}
      <div className="space-y-4">
        {units.map((unit) => (
          <div key={unit.id} className="p-4 bg-gray-800 rounded space-y-2">
            <div className="text-sm text-gray-400">원문</div>
            <div className="mb-2">{unit.source}</div>
            <div className="text-sm text-gray-400">번역</div>
            <input
              type="text"
              value={unit.target}
              onChange={(e) => handleChange(unit.id, e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <div className="flex items-center justify-between">
              <TMStatusBadge status={unit.status} />
              <button
                onClick={() => handleSave(unit.id)}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white"
              >
                저장
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}