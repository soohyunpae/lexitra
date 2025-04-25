'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Project = {
  id: number;
  name: string;
  note: string;
  createdAt: string;
  files: { id: number; filename: string }[];
};

export default function ProjectPage({ projectId }: { projectId: number }) {
  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedNote, setEditedNote] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      const res = await fetch(`/api/project/${projectId}`);
      const data = await res.json();
      setProject(data);
    };
    fetchProject();
  }, [projectId]);

  if (!project) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="p-6 text-black bg-white dark:text-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-semibold mb-2">{project.name}</h1>
      <p className="mb-2 text-gray-400">{project.note}</p>
      <p className="mb-6 text-sm text-gray-400">
        생성일: {new Date(project.createdAt).toLocaleString()}
      </p>

      <h2 className="text-xl font-semibold mb-4 text-white">📄 업로드된 파일</h2>
      {project.files?.length === 0 ? (
        <p className="text-gray-400">아직 업로드된 파일이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {project.files?.map((file) => (
            <li key={file.id}>
              <Link
                href={`/project/${project.id}/file/${file.id}`}
                className="text-blue-500 hover:underline"
              >
                {file.filename}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-4 mt-10">
        {!isEditing ? (
          <button
            onClick={() => {
              setEditedName(project.name);
              setEditedNote(project.note);
              setIsEditing(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            수정
          </button>
        ) : (
          <div className="flex flex-col gap-2 w-full max-w-md">
            <input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="프로젝트 이름"
              className="px-3 py-2 border rounded"
            />
            <textarea
              value={editedNote}
              onChange={(e) => setEditedNote(e.target.value)}
              placeholder="메모"
              className="px-3 py-2 border rounded"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  fetch('/api/update-project', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: projectId, name: editedName, note: editedNote }),
                  }).then(() => location.reload());
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                저장
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                취소
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
              fetch(`/api/delete-project?id=${projectId}`, {
                method: 'DELETE',
              }).then(() => (window.location.href = '/projects'));
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          삭제
        </button>
      </div>
    </div>
  );
}