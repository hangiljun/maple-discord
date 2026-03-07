"use client"
import { useRef, useState, DragEvent, useEffect } from "react"

interface Props {
  onFiles: (files: File[]) => void
  initialPreviews?: string[]
  onRemoveExisting?: (url: string) => void
}

export default function ImageUploader({ onFiles, initialPreviews = [], onRemoveExisting }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [entries, setEntries] = useState<{ preview: string; file: File }[]>([])

  // blob URL 정리
  useEffect(() => {
    return () => { entries.forEach(e => URL.revokeObjectURL(e.preview)) }
  }, [])

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"))
    const newEntries = arr.map(file => ({ preview: URL.createObjectURL(file), file }))
    setEntries(prev => {
      const updated = [...prev, ...newEntries]
      onFiles(updated.map(e => e.file))
      return updated
    })
  }

  const removeNew = (index: number) => {
    setEntries(prev => {
      URL.revokeObjectURL(prev[index].preview)
      const updated = prev.filter((_, i) => i !== index)
      onFiles(updated.map(e => e.file))
      return updated
    })
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const hasPreviews = initialPreviews.length > 0 || entries.length > 0

  return (
    <div className="space-y-2">
      {/* 기존 이미지 (수정 모드) */}
      {initialPreviews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {initialPreviews.map((url) => (
            <div key={url} className="relative">
              <img src={url} alt="기존 이미지" className="w-full h-24 object-contain rounded-lg border border-[#E5E8EB] bg-[#F9FAFB]" />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow transition-colors">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 새로 추가한 이미지 */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {entries.map((entry, i) => (
            <div key={entry.preview} className="relative">
              <img src={entry.preview} alt="미리보기" className="w-full h-24 object-contain rounded-lg border border-[#E5E8EB] bg-[#F9FAFB]" />
              <button
                type="button"
                onClick={() => removeNew(i)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow transition-colors">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 영역 */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl transition-colors cursor-pointer
          ${dragging
            ? "border-[#3182F6] bg-[#EBF3FE]"
            : "border-[#E5E8EB] bg-[#F9FAFB] hover:bg-[#F2F4F6]"}`}>
        <div className="py-6 px-4 text-center space-y-1">
          <p className="text-sm font-semibold text-[#4E5968]">
            {hasPreviews ? "이미지 추가하기" : "이미지 첨부"}
          </p>
          <p className="text-xs text-[#B0B8C1]">클릭 또는 드래그 · JPG, PNG, GIF, WEBP</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files)
          e.target.value = ""
        }}
      />
    </div>
  )
}
