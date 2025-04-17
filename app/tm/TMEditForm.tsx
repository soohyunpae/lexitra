'use client'

import { useState } from 'react'

export default function TMEditForm({ entry, onUpdate, onCancel }: {
  entry: any
  onUpdate: (updated: any) => void
  onCancel: () => void
}) {
  const [source, setSource] = useState(entry.source)
  const [target, setTarget] = useState(entry.target)
  const [comment, setComment] = useState(entry.comment || '')

  const handleSave = async () => {
    const res = await fetch('/api/update-tm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: entry.id,
        source,
        target,
        comment,
      }),
    })
    const data = await res.json()
    onUpdate(data)
  }

  return (
    <div className="border p-4 rounded bg-gray-50 mt-2">
      <div className="mb-2">
        <label className="block text-sm font-medium">원문</label>
        <textarea className="w-full border rounded p-1 text-sm" value={source} onChange={e => setSource(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">번역문</label>
        <textarea className="w-full border rounded p-1 text-sm" value={target} onChange={e => setTarget(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">코멘트</label>
        <input className="w-full border rounded px-2 py-1 text-sm" value={comment} onChange={e => setComment(e.target.value)} />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-gray-500 text-sm">취소</button>
        <button onClick={handleSave} className="bg-blue-600 text-white text-sm px-3 py-1 rounded">Update TM</button>
      </div>
    </div>
  )
}