"use client"
import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, serverTimestamp, query, orderBy, updateDoc
} from "firebase/firestore"
import { uploadImageFile } from "@/lib/storage"
import { onAuthStateChanged } from "firebase/auth"
import { isAdmin } from "@/lib/admin"
import ImageUploader from "@/app/components/ImageUploader"

interface Banner {
  id: string
  imageUrl: string
  description: string
  link: string
  order: number
  active: boolean
}

interface Notice {
  id: string
  title: string
  category: string
  createdAt?: any
  date: string
  pinned?: boolean
}

const EMPTY_FORM = { description: "", link: "" }

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [banners, setBanners] = useState<Banner[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editExistingUrl, setEditExistingUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [notices, setNotices] = useState<Notice[]>([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) setAdminUser(await isAdmin(u.uid))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const q = query(collection(db, "banners"), orderBy("order"))
    return onSnapshot(q, (snap) => {
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner)))
    })
  }, [])

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"))
    return onSnapshot(q, (snap) => {
      setNotices(snap.docs.map(d => {
        const data = d.data()
        const date = data.createdAt?.toDate()?.toLocaleDateString("ko-KR") || ""
        return { id: d.id, ...data, date } as Notice
      }))
    })
  }, [])

  const activeBanners = banners.filter(b => b.active)

  const handleAdd = async () => {
    if (!form.description.trim() || !form.link.trim()) {
      alert("설명과 링크를 입력해주세요"); return
    }
    if (activeBanners.length >= 4) {
      alert("활성 배너는 최대 4개까지 등록할 수 있어요"); return
    }
    setSaving(true)
    try {
      let imageUrl = ""
      if (imageFile) {
        imageUrl = await uploadImageFile(imageFile, `banners/${Date.now()}_${imageFile.name}`)
      }
      await addDoc(collection(db, "banners"), {
        imageUrl,
        description: form.description,
        link: form.link,
        order: banners.length + 1,
        active: true,
        createdAt: serverTimestamp(),
      })
      setForm(EMPTY_FORM)
      setImageFile(null)
    } catch (e: any) { alert("오류: " + e?.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("배너를 삭제할까요?")) return
    await deleteDoc(doc(db, "banners", id))
    if (editingId === id) cancelEdit()
  }

  const handleToggle = async (banner: Banner) => {
    if (!banner.active && activeBanners.length >= 4) {
      alert("활성 배너는 최대 4개까지 가능해요"); return
    }
    await updateDoc(doc(db, "banners", banner.id), { active: !banner.active })
  }

  const startEdit = (banner: Banner) => {
    setEditingId(banner.id)
    setForm({ description: banner.description, link: banner.link })
    setEditExistingUrl(banner.imageUrl)
    setEditImageFile(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setEditImageFile(null)
    setEditExistingUrl("")
  }

  const handlePinNotice = async (notice: Notice) => {
    await updateDoc(doc(db, "notices", notice.id), { pinned: !notice.pinned })
  }

  const handleUpdate = async () => {
    if (!form.description.trim() || !form.link.trim()) {
      alert("설명과 링크를 입력해주세요"); return
    }
    setSaving(true)
    try {
      let imageUrl = editExistingUrl
      if (editImageFile) {
        imageUrl = await uploadImageFile(editImageFile, `banners/${Date.now()}_${editImageFile.name}`)
      }
      await updateDoc(doc(db, "banners", editingId!), {
        imageUrl,
        description: form.description,
        link: form.link,
      })
      cancelEdit()
    } catch (e: any) { alert("오류: " + e?.message) }
    finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D6EEFF] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1877D4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#D6EEFF] flex items-center justify-center">
        <div className="text-center bg-white border-2 border-[#5BA8D8] rounded-2xl p-10">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-black text-[#0A3D6B] text-lg">관리자 권한이 필요합니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#D6EEFF] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#0A3D6B] to-[#1877D4] rounded-2xl p-5 shadow-lg">
          <h1 className="text-2xl font-black text-white">🛡️ 관리자 페이지</h1>
          <p className="text-sm text-sky-200 font-bold mt-1">배너 관리 · 공지 핀 관리 — 활성 배너 {activeBanners.length}/4</p>
        </div>

        {/* 추가 / 수정 폼 */}
        <div className="bg-white border-2 border-[#5BA8D8] rounded-2xl p-5 space-y-4 shadow-md">
          <p className="font-black text-[#0A3D6B] text-sm">
            {editingId ? "✏️ 배너 수정" : "➕ 새 배너 추가"}
          </p>

          <div>
            <p className="text-xs font-black text-[#0A3D6B] mb-1.5">📸 배너 이미지</p>
            <ImageUploader
              onFiles={(files) => editingId ? setEditImageFile(files[0] || null) : setImageFile(files[0] || null)}
              initialPreviews={editingId && editExistingUrl ? [editExistingUrl] : []}
              onRemoveExisting={() => setEditExistingUrl("")}
            />
          </div>

          <input
            type="text"
            placeholder="배너 설명 (예: 여름 이벤트 진행 중!)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full p-3 border-2 border-[#90C4E8] rounded-xl text-sm font-bold outline-none focus:border-[#1877D4]"
          />
          <div className="space-y-1">
            <input
              type="url"
              placeholder="클릭 시 이동할 링크 (https://...)"
              value={form.link}
              onChange={e => setForm({ ...form, link: e.target.value })}
              className="w-full p-3 border-2 border-[#90C4E8] rounded-xl text-sm font-bold outline-none focus:border-[#1877D4]"
            />
            <p className="text-[10px] text-gray-400 font-bold px-1">외부 사이트 링크 또는 사이트 내 경로 (/notice 등)</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              disabled={saving}
              className="flex-1 py-3 bg-[#1877D4] disabled:bg-gray-300 hover:bg-[#0D47A1] text-white rounded-xl font-black text-sm transition-colors">
              {saving ? "저장 중..." : (editingId ? "✅ 수정 완료" : "📢 배너 등록")}
            </button>
            {editingId && (
              <button onClick={cancelEdit}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-black text-sm transition-colors">
                취소
              </button>
            )}
          </div>
        </div>

        {/* 배너 목록 */}
        <div className="bg-white border-2 border-[#5BA8D8] rounded-2xl overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-[#0A3D6B] to-[#1877D4] px-4 py-2.5">
            <h2 className="font-black text-white text-sm">📋 등록된 배너 ({banners.length}개)</h2>
          </div>

          {banners.length === 0 ? (
            <p className="text-center text-[#5BA8D8] font-bold text-sm py-10">등록된 배너가 없어요</p>
          ) : (
            <div className="divide-y divide-[#EBF7FF]">
              {banners.map((banner) => (
                <div key={banner.id}
                  className={`flex items-center gap-3 p-4 ${editingId === banner.id ? "bg-[#EBF7FF]" : ""}`}>

                  {/* 썸네일 */}
                  <div className="w-20 h-14 bg-[#EBF7FF] rounded-xl overflow-hidden flex-shrink-0 border-2 border-[#90C4E8]">
                    {banner.imageUrl ? (
                      <img src={banner.imageUrl} alt={banner.description}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">📷</div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-[#0A3D6B] truncate">{banner.description}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{banner.link}</p>
                    <span className={`inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-full ${
                      banner.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                    }`}>
                      {banner.active ? "● 활성" : "○ 비활성"}
                    </span>
                  </div>

                  {/* 버튼 */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => startEdit(banner)}
                      className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#EBF7FF] text-[#1877D4] hover:bg-[#D0E8FF] transition-colors">
                      수정
                    </button>
                    <button onClick={() => handleToggle(banner)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-colors ${
                        banner.active
                          ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}>
                      {banner.active ? "비활성" : "활성화"}
                    </button>
                    <button onClick={() => handleDelete(banner.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-black bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                      삭제
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* 공지 핀 관리 */}
        <div className="bg-white border-2 border-[#5BA8D8] rounded-2xl overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-[#0A3D6B] to-[#1877D4] px-4 py-2.5">
            <h2 className="font-black text-white text-sm">📌 공지 핀 관리 ({notices.filter(n => n.pinned).length}개 고정 중)</h2>
          </div>

          {notices.length === 0 ? (
            <p className="text-center text-[#5BA8D8] font-bold text-sm py-10">등록된 공지가 없어요</p>
          ) : (
            <div className="divide-y divide-[#EBF7FF]">
              {[...notices].sort((a, b) => {
                if (a.pinned && !b.pinned) return -1
                if (!a.pinned && b.pinned) return 1
                return 0
              }).map((notice) => (
                <div key={notice.id} className={`flex items-center gap-3 px-4 py-3 ${notice.pinned ? "bg-red-50" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {notice.pinned && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-100 text-red-500 border border-red-200">📌 고정</span>
                      )}
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#EBF7FF] text-[#1877D4]">{notice.category}</span>
                      <span className="text-xs text-[#8B95A1]">{notice.date}</span>
                    </div>
                    <p className="font-bold text-sm text-[#0A3D6B] mt-1 truncate">{notice.title}</p>
                  </div>
                  <button
                    onClick={() => handlePinNotice(notice)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors flex-shrink-0 ${
                      notice.pinned
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-[#EBF7FF] text-[#1877D4] hover:bg-[#D0E8FF]"
                    }`}>
                    {notice.pinned ? "고정 해제" : "📌 고정"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
