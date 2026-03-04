"use client"
import { useRef, useState, DragEvent, useEffect } from "react"

interface Props {
  onFile: (file: File | null) => void
  initialPreview?: string
}

export default function ImageUploader({ onFile, initialPreview }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const blobUrlRef = useRef<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<string>(initialPreview || "")

  useEffect(() => {
    setPreview(initialPreview || "")
  }, [initialPreview])

  // blob URL 메모리 누수 방지
  useEffect(() => {
    return () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current) }
  }, [])

  const handleFile = (file: File | null) => {
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null }
    if (!file) { setPreview(""); onFile(null); return }
    const url = URL.createObjectURL(file)
    blobUrlRef.current = url
    setPreview(url)
    onFile(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) handleFile(file)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl transition-colors cursor-pointer
          ${dragging
            ? "border-[#1877D4] bg-[#D0E8FF]"
            : "border-[#90C4E8] bg-[#F8FCFF] hover:bg-[#EBF7FF]"}`}>
        {preview ? (
          <div className="relative p-2">
            <img src={preview} alt="미리보기" className="max-h-44 w-full mx-auto rounded-lg object-contain" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleFile(null) }}
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-black shadow-md transition-colors">
              ✕
            </button>
          </div>
        ) : (
          <div className="py-8 px-4 text-center space-y-2">
            <div className="text-4xl">📸</div>
            <p className="text-sm font-black text-[#1877D4]">클릭하거나 사진을 끌어다 놓으세요</p>
            <p className="text-xs text-gray-400 font-bold">JPG · PNG · GIF · WEBP</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          handleFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}
