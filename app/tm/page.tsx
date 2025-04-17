'use client'

import { useEffect, useState } from 'react'
import TMEditForm from './TMEditForm'

interface TMEntry {
  id: number
  source: string
  target: string
  sourceLang: string
  targetLang: string
  comment: string | null
  updatedAt: string
}

export default function TMPage() {
  const [entries, setEntries] = useState<TMEntry[]>([])
  const [query, setQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<TMEntry | null>(null)

  const fetchTM = async () => {
    try {
      const res = await fetch(`/api/search_tm?query=${encodeURIComponent(query)}&sourceLang=ko&targetLang=en`)
      const data = await res.json()
      setEntries(data)
    } catch (e) {
      console.error('TM fetch failed:', e)
    }
  }

  useEffect(() => {
    fetchTM()
  }, [])

  const handleSearch = async () => {
    await fetchTM()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await fetch(`/api/delete-tm?id=${id}`, { method: 'DELETE' })
    fetchTM()
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🧾 TM 관리</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border px-3 py-2 rounded w-full max-w-md"
          placeholder="원문/번역/코멘트 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          검색
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border bg-white text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">원문</th>
              <th className="p-2 border">번역</th>
              <th className="p-2 border">언어쌍</th>
              <th className="p-2 border">코멘트</th>
              <th className="p-2 border">관리</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t align-top">
                <td className="p-2 whitespace-pre-wrap w-1/3">{entry.source}</td>
                <td className="p-2 whitespace-pre-wrap w-1/3">{entry.target}</td>
                <td className="p-2">{entry.sourceLang} → {entry.targetLang}</td>
                <td className="p-2 italic text-gray-500">{entry.comment || '-'}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="text-blue-600 hover:underline"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
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

      {selectedEntry && (
        <TMEditForm
          entry={selectedEntry}
          onUpdate={() => {
            setSelectedEntry(null)
            fetchTM()
          }}
          onCancel={() => setSelectedEntry(null)}
        />
      )}
    </div>
  )
}
