"use client"

import { useState } from "react"
import { Plus, X, Send } from "lucide-react"
import { createMomentAction } from "@/actions/moments"
import { ImageUploader } from "./ImageUploader"
import { useRouter } from "next/navigation"

export function AddMomentButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [emoji, setEmoji] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!imageUrl) {
      setError("Please add a photo")
      return
    }

    setError("")
    setSaving(true)

    const fd = new FormData()
    fd.append("imageUrl", imageUrl)
    if (caption) fd.append("caption", caption)
    if (emoji) fd.append("emoji", emoji)

    const result = await createMomentAction(fd)
    setSaving(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setOpen(false)
    setImageUrl("")
    setCaption("")
    setEmoji("")
    router.refresh()
  }

  const QUICK_EMOJIS = ["😍", "🥹", "😂", "❤️", "🎉", "🌟", "🔥", "👏"]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="famli-btn-primary flex items-center gap-1.5 text-sm px-4 py-2.5"
      >
        <Plus className="w-4 h-4" />
        Add
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 animate-slide-up h-[85dvh] overflow-y-auto overscroll-contain touch-pan-y">
            <div className="flex items-center justify-between mb-5 sticky top-0 bg-white z-10 pb-2">
              <h2 className="text-lg font-bold text-stone-900">Share a Moment</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 pb-24">
              <ImageUploader
                onUpload={setImageUrl}
                folder="famli/moments"
                size="lg"
                className="items-start"
              />

              <div>
                <label className="famli-label">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What's this moment about? ✨"
                  rows={3}
                  maxLength={500}
                  className="famli-input resize-none"
                />
              </div>

              <div>
                <label className="famli-label">Add emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {QUICK_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(emoji === e ? "" : e)}
                      className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                        emoji === e
                          ? "bg-famli-100 ring-2 ring-famli-400"
                          : "bg-orange-50 hover:bg-famli-50"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={saving || !imageUrl}
                className="famli-btn-primary w-full flex items-center justify-center gap-2 sticky bottom-0"
                type="button"
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Share moment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}