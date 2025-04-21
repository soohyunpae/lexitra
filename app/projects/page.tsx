'use client';

import React, { useEffect, useState } from 'react';

interface Project {
  id: number;
  name: string;
  note: string;  // description을 note로 변경
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectNote, setNewProjectNote] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    try {
      const res = await fetch('/api/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          note: newProjectNote,  // description을 note로 변경
        }),
      });
      const newProject = await res.json();
      setProjects((prev) => [...prev, newProject]);
      setNewProjectName('');
      setNewProjectNote('');
    } catch (e) {
      console.error('Failed to create project:', e);
    }
  };

  const handleUpdateProject = async (id: number, name: string, note: string) => {
    try {
      const res = await fetch('/api/update-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name,
          note,
        }),
      });
  
      if (!res.ok) {
        const errorMessage = await res.text();
        console.error('Error:', errorMessage);
        throw new Error('Failed to update project');
      }
  
      const updatedProject = await res.json();
      // 수정된 프로젝트를 목록에 반영
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === updatedProject.id ? { ...project, name: updatedProject.name, note: updatedProject.note } : project
        )
      );
  
      setSelectedProject(null);
    } catch (e) {
      console.error('Failed to update project:', e);
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      const res = await fetch(`/api/delete-project?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
  
      if (!res.ok) {
        console.error('Failed to delete project:', data.error || 'Unknown error');
        throw new Error(data.error || 'Failed to delete project');
      }
  
      setProjects((prev) => prev.filter((project) => project.id !== id));
    } catch (e) {
      console.error('Failed to delete project:', e);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📋 프로젝트 목록</h1>

      {/* 프로젝트 생성 폼 */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">프로젝트 생성</h1>

        <div className="mb-4 space-y-3">
          <input
            type="text"
            placeholder="프로젝트 이름"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <textarea
            placeholder="프로젝트 설명"
            value={newProjectNote}
            onChange={(e) => setNewProjectNote(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          onClick={handleCreateProject}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          프로젝트 생성
        </button>
      </div>

      {/* 프로젝트 목록 테이블 */}
      <div className="overflow-x-auto p-6 bg-gray-900 shadow-sm rounded-md mb-6">
        <table className="w-full text-sm table-auto border-collapse text-gray-800 dark:text-white">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="border p-2 text-left text-gray-800 dark:text-white">프로젝트 이름</th>
              <th className="border p-2 text-left text-gray-800 dark:text-white">설명</th>
              <th className="border p-2 text-left text-gray-800 dark:text-white">생성일</th>
              <th className="border p-2 text-left text-gray-800 dark:text-white">수정일</th>
              <th className="border p-2 text-left text-gray-800 dark:text-white">관리</th>
            </tr>
          </thead>
          <tbody>
              {projects.map((project) => (
              <tr key={project.id} className="border-t dark:border-gray-700">
                <td className="p-2 text-gray-800 dark:text-white">{project.name}</td>
                <td className="p-2 text-gray-800 dark:text-white">{project.note}</td>
                <td className="p-2 text-gray-800 dark:text-white">{new Date(project.createdAt).toLocaleString()}</td>
                <td className="p-2 text-gray-800 dark:text-white">{new Date(project.updatedAt).toLocaleString()}</td>
                <td className="p-2 text-gray-800 dark:text-white">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-blue-600 dark:text-blue-400 hover:underline mr-2"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}  // 삭제 버튼 클릭 시 삭제 처리
                    className="text-red-600 dark:text-red-400 hover:underline"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 프로젝트 수정 폼 */}
      {selectedProject && (
        <div className="p-6 bg-gray-900 shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">프로젝트 수정</h2>

          <div className="mb-4 space-y-3">
            <input
              type="text"
              className="border p-2 rounded w-full text-white bg-gray-800 placeholder-gray-500"
              value={selectedProject.name}
              onChange={(e) => setSelectedProject({ ...selectedProject, name: e.target.value })}
            />
            <textarea
              className="border p-2 rounded w-full text-white bg-gray-800 placeholder-gray-500"
              value={selectedProject?.note || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  note: e.target.value,
                })
              }
            />
          </div>

          <button
            onClick={() => handleUpdateProject(selectedProject.id, selectedProject.name, selectedProject.note)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            수정 완료
          </button>
          <button
            onClick={() => setSelectedProject(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 ml-2"
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}