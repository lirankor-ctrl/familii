"use client"

import { useState } from "react"
import { Plus, X, Send } from "lucide-react"
import { createExperienceAction } from "@/actions/experiences"
import { ImageUploader } from "./ImageUploader"
import { useRouter } from "next/navigation"

export function AddExperienceButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSaving(true)

    const fd = new FormData(e.currentTarget)
    if (imageUrl) fd.set("imageUrl", imageUrl)

    const result = await createExperienceAction(fd)
    setSaving(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setOpen(false)
    setImageUrl("")
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="famli-btn-primary flex items-center gap-1.5 text-sm px-4 py-2.5"
      >
        <Plus className="w-4 h-4" />
        Share
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 animate-slide-up h-[85dvh] overflow-y-auto overscroll-contain touch-pan-y">
            <div className="flex items-center justify-between mb-5 sticky top-0 bg-white z-10 pb-2">
              <h2 className="text-lg font-bold text-stone-900">Share an Experience</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-24">
              <div>
                <label className="famli-label">
                  Title <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="My first solo hike..."
                  className="famli-input"
                />
              </div>

              <div>
                <label className="famli-label">Your story</label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  placeholder="Tell your family about it... ✨"
                  className="famli-input resize-none"
                  maxLength={3000}
                />
              </div>

              <div>
                <label className="famli-label">
                  Add a photo <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <ImageUploader
                  onUpload={setImageUrl}
                  folder="famli/experiences"
                  size="sm"
                  className="items-start"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="famli-btn-primary w-full flex items-center justify-center gap-2 sticky bottom-0"
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Share with family
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
