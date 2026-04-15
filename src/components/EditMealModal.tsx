"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { updateMealAction } from "@/actions/meals"
import { ImageUploader } from "@/components/ImageUploader"
import type { MealWithRSVPs } from "@/types"

interface EditMealModalProps {
  meal: MealWithRSVPs
  open: boolean
  onClose: () => void
  onSaved: () => void
}

function toDateTimeLocal(date: Date | string): string {
  const d = new Date(date)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EditMealModal({ meal, open, onClose, onSaved }: EditMealModalProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [imageUrl, setImageUrl] = useState(meal.imageUrl ?? "")

  if (!open) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSaving(true)

    const fd = new FormData(e.currentTarget)
    fd.set("imageUrl", imageUrl)

    const result = await updateMealAction(meal.id, fd)
    setSaving(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    onClose()
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 animate-slide-up h-[85dvh] overflow-y-auto overscroll-contain touch-pan-y">
        <div className="flex items-center justify-between mb-5 sticky top-0 bg-white z-10 pb-2">
          <h2 className="text-lg font-bold text-stone-900">Edit Meal</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-24">
          <div className="flex justify-center">
            <ImageUploader
              folder="famli/meals"
              size="lg"
              currentImage={meal.imageUrl ?? undefined}
              onUpload={(url) => setImageUrl(url)}
            />
          </div>
          <input type="hidden" name="imageUrl" value={imageUrl} />

          <div>
            <label className="famli-label">Title</label>
            <input
              name="title"
              type="text"
              required
              defaultValue={meal.title}
              placeholder="Sunday Dinner 🍝"
              className="famli-input"
            />
          </div>

          <div>
            <label className="famli-label">Date & Time</label>
            <input
              name="scheduledAt"
              type="datetime-local"
              required
              defaultValue={toDateTimeLocal(meal.scheduledAt)}
              className="famli-input"
            />
          </div>

          <div>
            <label className="famli-label">
              Location <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <input
              name="location"
              type="text"
              defaultValue={meal.location ?? ""}
              placeholder="Home, Restaurant name..."
              className="famli-input"
            />
          </div>

          <div>
            <label className="famli-label">
              Notes <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="notes"
              rows={4}
              defaultValue={meal.notes ?? ""}
              placeholder="What's on the menu? Any requests?"
              className="famli-input resize-none"
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
              "Save changes"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
