'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  newProjectName: string;
  newProjectNote: string;
  setNewProjectName: (name: string) => void;
  setNewProjectNote: (note: string) => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  handleCreateProject: () => void;
}

export default function CreateProjectModal({
  open,
  onClose,
  newProjectName,
  newProjectNote,
  setNewProjectName,
  setNewProjectNote,
  selectedFiles,
  setSelectedFiles,
  handleCreateProject,
}: CreateProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const router = useRouter();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 handleSubmit fired');
    console.log('📡 Sending POST to /api/projects');
    e.preventDefault();
    setLoading(true);

    // Debug: Log selectedFiles at submit
    console.log('✅ selectedFiles at submit:', selectedFiles);

    const formData = new FormData();
    formData.append('name', newProjectName);
    formData.append('note', newProjectNote);
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });
    console.log('📤 Files being uploaded:', selectedFiles);
    formData.forEach((value, key) => {
      console.log(`🧾 ${key}:`, value);
    });

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });
      console.log('✅ POST fetch completed');
      console.log('🎯 fetch 완료:', res.status);

      setLoading(false);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('서버 에러:', errorText || '(본문 없음)');
        alert('프로젝트 생성에 실패했습니다.');
        return;
      }

      const data = await res.json();
      setUploadedUrls(data.files || []);
      router.push(`/project/${data.id}`);
      onClose();
    } catch (error) {
      setLoading(false);
      console.error('요청 중 오류 발생:', error);
      alert('서버와 통신 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 text-black dark:text-white rounded shadow-lg p-6 z-10 max-w-lg w-full">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          ×
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold">새 프로젝트 생성</h2>
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="프로젝트 이름"
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            value={newProjectNote}
            onChange={(e) => setNewProjectNote(e.target.value)}
            placeholder="설명 (선택)"
            className="w-full p-2 border rounded"
          />
          <label className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
            파일 선택
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                console.log('🧾 Files selected in input:', files);
                setSelectedFiles(files);
              }}
              className="hidden"
            />
          </label>
          {Array.isArray(selectedFiles) && selectedFiles.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700">
              {selectedFiles.map((file, idx) => (
                <li key={idx} className="truncate">{file.name}</li>
              ))}
            </ul>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? '생성 중...' : '생성'}
          </button>
        </form>
        {uploadedUrls.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">업로드된 파일</h3>
            <ul className="list-disc list-inside text-sm text-blue-600">
              {uploadedUrls.map((url, index) => (
                <li key={index}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}