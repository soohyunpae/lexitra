'use client'

import { useRef, useState } from 'react'
import TMSearchPanel from '../../components/TMSearchPanel'

export default function UploadPage() {
  const [fileContent, setFileContent] = useState('')
  const [segments, setSegments] = useState<string[]>([])
  const [translations, setTranslations] = useState<string[]>([])
  const [tmMatches, setTmMatches] = useState<{ target: string; score: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState<boolean[]>([])
  const [modified, setModified] = useState<boolean[]>([])
  const [selectedFileName, setSelectedFileName] = useState('')

  // useRef를 활용해 파일 입력(input type="file") 요소를 컨트롤
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 커스텀 버튼 클릭 시 숨겨진 파일 입력 클릭
  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFileName(file.name)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target?.result as string
      setFileContent(text)
      const split = text.split(/(?<=[.!?\n])\s+/) // 문장 단위 분할
      setSegments(split)
      setSaved(Array(split.length).fill(false))
      setModified(Array(split.length).fill(false))
      await handleTranslate(split)
    }
    reader.readAsText(file)
  }

  const handleTranslate = async (sentences: string[]) => {
    const newTranslations: string[] = []
    const newMatches: { target: string; score: number }[] = []
    setLoading(true)

    for (const sentence of sentences) {
      try {
        const tmRes = await fetch(`/api/check_tm?text=${encodeURIComponent(sentence)}&sourceLang=ko&targetLang=en`)
        const tmData = await tmRes.json()
        if (tmData?.score >= 70) {
          newTranslations.push(tmData.target)
          newMatches.push({ target: tmData.target, score: tmData.score })
          continue
        }

        const gptRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sentence, sourceLang: 'ko', targetLang: 'en' }),
        })
        const gptData = await gptRes.json()
        newTranslations.push(gptData.result)
        newMatches.push({ target: gptData.result, score: 0 })
      } catch (err) {
        newTranslations.push('(번역 실패)')
        newMatches.push({ target: '', score: 0 })
      }
    }

    setTranslations(newTranslations)
    setTmMatches(newMatches)
    setLoading(false)
  }

  const handleTranslationChange = (e: React.ChangeEvent<HTMLTextAreaElement>, idx: number) => {
    const newTranslations = [...translations]
    const newModified = [...modified]
    newTranslations[idx] = e.target.value
    newModified[idx] = true
    setTranslations(newTranslations)
    setModified(newModified)
    setSaved((prev) => {
      const updated = [...prev]
      updated[idx] = false
      return updated
    })
  }

  const handleSave = async (idx: number) => {
    const source = segments[idx]
    const target = translations[idx]

    try {
      const res = await fetch('/api/update_tm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: [
            {
              source,
              target,
              sourceLang: 'ko',
              targetLang: 'en',
              updatedAt: new Date().toISOString(),
            },
          ],
        }),
      })
      const data = await res.json()
      if (data.status === 'ok') {
        const newSaved = [...saved]
        const newModified = [...modified]
        newSaved[idx] = true
        newModified[idx] = false
        setSaved(newSaved)
        setModified(newModified)
      }
    } catch (err) {
      console.error(err)
      alert('❌ 저장 실패')
    }
  }

  const handleUndo = (idx: number) => {
    // 되돌리기: 기존에 TM 매치 결과가 있으면 해당 값을 사용
    const newTranslations = [...translations]
    // 만약 TM 매치 결과가 없다면, 원본 문장으로 되돌리거나 GPT 번역 결과를 이용할 수 있습니다.
    newTranslations[idx] = tmMatches[idx]?.target || segments[idx] || ''
    setTranslations(newTranslations)
    const newModified = [...modified]
    newModified[idx] = false
    setModified(newModified)
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">📄 문서 업로드 및 편집</h1>

        {/* 숨겨진 파일 입력 요소 (Next.js 에서 Tailwind의 hidden 클래스 사용) */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 커스텀 파일 선택 버튼과 파일명 표시 */}
        <div className="mb-6">
          <button
            onClick={handleChooseFile}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            파일 선택
          </button>
          {selectedFileName && (
            <span className="ml-4 text-sm text-gray-700">선택된 파일: {selectedFileName}</span>
          )}
        </div>

        {loading && <p className="text-sm text-gray-500 mb-4">🔄 번역 중입니다...</p>}

        {segments.map((sentence, idx) => (
          <div
            key={idx}
            className={`border rounded bg-white p-4 mb-4 shadow-sm ${saved[idx] ? 'border-green-400' : ''}`}
          >
            <p className="text-sm text-gray-800 mb-2">
              📝 <span className="font-medium">원문:</span> {sentence}
            </p>

            <textarea
              className="w-full border p-2 text-sm text-gray-800 rounded resize-y mb-2"
              value={translations[idx]}
              onChange={(e) => handleTranslationChange(e, idx)}
            />

            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                {tmMatches[idx]?.score >= 100 ? (
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">100% TM</span>
                ) : tmMatches[idx]?.score >= 70 ? (
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Fuzzy {tmMatches[idx].score}%</span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">수동 입력</span>
                )}
                {saved[idx] && (
                  <span className="text-xs text-green-600 font-medium">저장됨</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUndo(idx)}
                  className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                  disabled={!modified[idx]}
                >
                  되돌리기
                </button>
                <button
                  onClick={() => handleSave(idx)}
                  className={`text-xs px-3 py-1 rounded text-white ${modified[idx] ? 'bg-gray-800 hover:bg-black' : 'bg-gray-400 cursor-not-allowed'}`}
                  disabled={!modified[idx]}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      <TMSearchPanel onSelect={(item) => console.log("선택된 TM:", item)} />
    </div>
  )
}