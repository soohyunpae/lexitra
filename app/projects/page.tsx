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
      <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-3">프로젝트 생성</h2>
        <input
          type="text"
          className="border px-4 py-2 rounded w-full mb-3"
          placeholder="프로젝트 이름"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <textarea
          className="border px-4 py-2 rounded w-full mb-3"
          placeholder="프로젝트 설명"
          value={newProjectNote}
          onChange={(e) => setNewProjectNote(e.target.value)}
        />
        <button
          onClick={handleCreateProject}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          프로젝트 생성
        </button>
      </div>

      {/* 프로젝트 목록 테이블 */}
      <div className="overflow-x-auto bg-white shadow-sm rounded-md mb-6">
        <table className="w-full text-sm table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">프로젝트 이름</th>
              <th className="border p-2 text-left">설명</th>
              <th className="border p-2 text-left">생성일</th>
              <th className="border p-2 text-left">수정일</th>
              <th className="border p-2 text-left">관리</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t">
                <td className="p-2">{project.name}</td>
                <td className="p-2">{project.note}</td>
                <td className="p-2">{new Date(project.createdAt).toLocaleString()}</td>
                <td className="p-2">{new Date(project.updatedAt).toLocaleString()}</td>
                <td className="p-2">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}  // 삭제 버튼 클릭 시 삭제 처리
                    className="text-red-600 hover:underline"
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
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h2 className="text-xl font-semibold mb-3">프로젝트 수정</h2>
          <input
            type="text"
            className="border px-4 py-2 rounded w-full mb-3"
            value={selectedProject.name}
            onChange={(e) => setSelectedProject({ ...selectedProject, name: e.target.value })}
          />
          <textarea
            className="border px-4 py-2 rounded w-full mb-3"
            value={selectedProject?.note || ""} // selectedProject가 null이면 빈 문자열을 사용
            onChange={(e) =>
              setSelectedProject({
                ...selectedProject,
                note: e.target.value,
                })
              }
          />
          <button
            onClick={() => handleUpdateProject(selectedProject.id, selectedProject.name, selectedProject.note)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            수정 완료
          </button>
          <button
            onClick={() => setSelectedProject(null)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-2"
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}