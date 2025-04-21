'use client'

import { useState } from 'react'
import TMStatusBadge from './TMStatusBadge';
import Modal from './Modal';
import TMEditForm from './TMEditForm';

export default function TMTable({ entries, filePath }: { entries: any[]; filePath: string }) {
  const [search, setSearch] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

  const filtered = entries.filter((e) =>
    e.source.toLowerCase().includes(search.toLowerCase()) ||
    e.target.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (entry: any) => {
    const confirmed = confirm('정말 삭제하시겠습니까?')
    if (!confirmed) return

    await fetch('/api/delete_tm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: entry.source,
        targetLang: entry.targetLang,
      }),
    })

    location.reload()
  }

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded"
          placeholder="Search TM by source or target..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Source</th>
            <th className="border px-2 py-1">Target</th>
            <th className="border px-2 py-1">Lang</th>
            <th className="border px-2 py-1">Updated</th>
            <th className="border px-2 py-1">Action</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Comment</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((entry, idx) => {
            console.log("🔎 TM Entry:", entry);
            return (
              <tr key={idx} className="hover:bg-gray-50">
              <td className="border px-2 py-1 align-top whitespace-pre-wrap">{entry.source}</td>
              <td className="border px-2 py-1 align-top whitespace-pre-wrap">
                {entry.target}
              </td>
              <td className="border px-2 py-1 text-center">{entry.sourceLang} → {entry.targetLang}</td>
              <td className="border px-2 py-1 text-xs text-gray-500 text-center">{new Date(entry.updatedAt).toLocaleString()}</td>
              <td className="border px-2 py-1 text-center space-y-1">
                <button
                  onClick={() => setSelectedEntry(entry)}
                  className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 w-full"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(entry)}
                  className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 w-full"
                >
                  삭제
                </button>
              </td>
              <td className="border px-2 py-1 text-center">
                <TMStatusBadge status={entry.status || 'MT'} />
              </td>
              <td className="border px-2 py-1 text-xs text-gray-700 whitespace-pre-wrap">
                {entry.comment || ''}
              </td>
            </tr>
          })}
        </tbody>
      </table>
    {selectedEntry && (
      <Modal open={true} onClose={() => setSelectedEntry(null)}>
        <TMEditForm
          initialSource={selectedEntry.source}
          initialTarget={selectedEntry.target}
          initialComment={selectedEntry.comment}
          initialStatus={selectedEntry.status}
          onUpdate={() => {
            setSelectedEntry(null);
            location.reload(); // refresh to reflect update
          }}
        />
      </Modal>
    )}
    </>
  )
}
