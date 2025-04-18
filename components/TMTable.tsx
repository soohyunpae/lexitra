'use client'

import { useState } from 'react'
import TMStatusBadge from './TMStatusBadge';
import Modal from './Modal';
import TMEditForm from './TMEditForm';

export default function TMTable({ entries, filePath }: { entries: any[]; filePath: string }) {
  const [search, setSearch] = useState('')
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editedText, setEditedText] = useState('')
  const [editedComment, setEditedComment] = useState('')
  const [editedStatus, setEditedStatus] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

  const filtered = entries.filter((e) =>
    e.source.toLowerCase().includes(search.toLowerCase()) ||
    e.target.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (idx: number, currentTarget: string, currentComment: string, currentStatus: string) => {
    setEditIndex(idx)
    setEditedText(currentTarget)
    setEditedComment(currentComment || '')
    setEditedStatus(currentStatus || 'MT')
  }

  const handleSave = async (idx: number) => {
    const updated = [...entries]
    updated[idx].target = editedText
    updated[idx].comment = editedComment
    updated[idx].status = editedStatus
    updated[idx].updatedAt = new Date().toISOString()

    await fetch('/api/update-tm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: updated }),
    })

    setEditIndex(null)
    setEditedText('')
    location.reload()
  }

  const handleDelete = async (idx: number) => {
    const confirmed = confirm('정말 삭제하시겠습니까?')
    if (!confirmed) return

    const updated = entries.filter((_, i) => i !== idx)

    await fetch('/api/update-tm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: updated }),
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
                {editIndex === idx ? (
                  <textarea
                    className="w-full border p-1 rounded"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                  />
                ) : (
                  entry.target
                )}
              </td>
              <td className="border px-2 py-1 text-center">{entry.sourceLang} → {entry.targetLang}</td>
              <td className="border px-2 py-1 text-xs text-gray-500 text-center">{new Date(entry.updatedAt).toLocaleString()}</td>
              <td className="border px-2 py-1 text-center space-y-1">
                {editIndex === idx ? (
                  <button
                    onClick={() => handleSave(idx)}
                    className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 w-full"
                  >
                    저장
                  </button>
                ) : (
                <button
                    onClick={() => setSelectedEntry(entry)}
                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 w-full"
                  >
                    수정
                  </button>
                )}
                <button
                  onClick={() => handleDelete(idx)}
                  className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 w-full"
                >
                  삭제
                </button>
              </td>
              <td className="border px-2 py-1 text-center">
                {editIndex === idx ? (
                  <select
                    className="w-full border p-1 rounded"
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                  >
                    <option value="MT">MT</option>
                    <option value="Fuzzy">Fuzzy</option>
                    <option value="Exact">Exact</option>
                    <option value="Approved">Approved</option>
                  </select>
                ) : (
                  <TMStatusBadge status={entry.status || 'MT'} />
                )}
              </td>
              <td className="border px-2 py-1 text-xs text-gray-700 whitespace-pre-wrap">
                {editIndex === idx ? (
                  <textarea
                    className="w-full border p-1 rounded"
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                  />
                ) : (
                  entry.comment || ''
                )}
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
