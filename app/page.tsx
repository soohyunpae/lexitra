// app/page.tsx

'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold mb-8">Lexitra 대시보드</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/upload" className="p-6 bg-white rounded shadow hover:bg-blue-50">
          <h2 className="text-xl font-semibold mb-2">📄 문서 업로드 & 번역</h2>
          <p className="text-gray-600 text-sm">텍스트 파일을 업로드하고 자동 번역을 시작합니다.</p>
        </Link>

        <Link href="/tm_management" className="p-6 bg-white rounded shadow hover:bg-blue-50">
          <h2 className="text-xl font-semibold mb-2">🧾 TM 관리</h2>
          <p className="text-gray-600 text-sm">번역 메모리(Termbase)를 확인하고 수정·삭제할 수 있습니다.</p>
        </Link>

        {/* 향후 프로젝트 기반 구조 도입 시 */}
        <Link href="/projects" className="p-6 bg-white rounded shadow hover:bg-blue-50">
          <h2 className="text-xl font-semibold mb-2">📁 프로젝트 목록</h2>
          <p className="text-gray-600 text-sm">진행 중인 프로젝트를 확인하거나 새로 생성할 수 있습니다.</p>
        </Link>
      </div>
    </main>
  )
}