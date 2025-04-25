'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen dark:bg-black dark:text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Lexitra 대시보드</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/projects" className="p-6 bg-white dark:bg-gray-900 rounded shadow hover:bg-blue-50 dark:hover:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">📁 프로젝트 관리</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">프로젝트를 열람하거나 새로 생성할 수 있습니다.</p>
        </Link>
        
        <Link href="/tm_management" className="p-6 bg-white dark:bg-gray-900 rounded shadow hover:bg-blue-50 dark:hover:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">🧾 TM 관리</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">번역 메모리를 확인하고 수정·삭제할 수 있습니다.</p>
        </Link>
        
        <Link href="/termbase" className="p-6 bg-white dark:bg-gray-900 rounded shadow hover:bg-blue-50 dark:hover:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">📚 용어집 관리</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">용어집을 등록하거나 업로드하고 항목을 수정·삭제할 수 있습니다.</p>
        </Link>
      </div>
    </main>
  )
}