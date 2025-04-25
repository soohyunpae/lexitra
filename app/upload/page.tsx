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
  const [originals, setOriginals] = useState<string[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

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
      const split = text.split(/\n+/)
        .map(s => s.trim())
        .filter(s => s && s !== '[]' && s !== '[ ]')
      setSegments(split)
      setSaved(Array(split.length).fill(false))
      setModified(Array(split.length).fill(false))
      await handleTranslate(split)
      setLoading(false)
    }
    reader.readAsText(file)
  }

  const handleTranslate = async (sentences: string[]) => {
    const newTranslations: string[] = [];
    const newMatches: { target: string; score: number }[] = [];
    setLoading(true)

    for (const sentence of sentences) {
      try {
        const tmRes = await fetch(`/api/check_tm?text=${encodeURIComponent(sentence)}&sourceLang=ko&targetLang=en`);
        const tmData = await tmRes.json();
        if (tmData?.score >= 70) {
          newTranslations.push(tmData.target);
          newMatches.push({ target: tmData.target, score: tmData.score });
          continue;
        }
        const gptRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sentence, sourceLang: 'ko', targetLang: 'en' }),
        });
        const gptData = await gptRes.json();
        newTranslations.push(gptData.translatedText);
        newMatches.push({ target: gptData.translatedText, score: 0 });
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error('Unknown error:', err);
        }
        newTranslations.push('(번역 실패)');
        newMatches.push({ target: '', score: 0 });
      }
    }

    setTranslations(newTranslations);
    setTmMatches(newMatches);
    setLoading(false);
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
    const target = translations[idx] || ''

    try {
      const res = await fetch('/api/update_tm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          target,
          sourceLang: 'ko',
          targetLang: 'en',
          status: 'MT',
          comment: '',
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('Unknown error:', err);
      }
      alert('❌ 저장 실패')
    }
  }

  const handleUndo = (idx: number) => {
    const newTranslations = [...translations]
    newTranslations[idx] = originals[idx] || tmMatches[idx]?.target || segments[idx] || ''
    setTranslations(newTranslations)
    const newModified = [...modified]
    newModified[idx] = false
    setModified(newModified)
  }

  console.log("🔎 segments", segments)
  console.log("🔎 translations", translations)

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-black text-gray-800 dark:text-white">
        <h1 className="text-2xl font-bold mb-4">📄 문서 업로드 및 편집</h1>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          className="hidden"
        />

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

        {segments.map((sentence, idx) => {
          return (
            <div
              key={idx}
              className={`border rounded p-4 mb-4 shadow-sm bg-white dark:bg-gray-900 ${saved[idx] ? 'border-green-400' : ''}`}
            >
              <p className="text-sm text-gray-800 dark:text-gray-100 mb-2">
                📝 <span className="font-medium">원문:</span> {sentence}
              </p>

              <textarea
                className="w-full border p-2 text-sm rounded resize-y mb-2 text-gray-800 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500"
                value={translations[idx] || ''}
                onChange={(e) => handleTranslationChange(e, idx)}
              />

              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  {tmMatches[idx]?.score >= 100 ? (
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">100% TM</span>
                  ) : tmMatches[idx]?.score >= 70 ? (
                    <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200">Fuzzy {tmMatches[idx].score}%</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">수동 입력</span>
                  )}
                  {saved[idx] && (
                    <span className="text-xs text-green-600 font-medium">저장됨</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUndo(idx)}
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
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
          );
        })}
      </main>

          <TMSearchPanel onSelect={(item) => console.log('선택된 TM:', item)} />
    </div>
  )
}