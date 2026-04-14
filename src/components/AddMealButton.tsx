"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { createMealAction } from "@/actions/meals"
import { useRouter } from "next/navigation"

export function AddMealButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSaving(true)

    const result = await createMealAction(new FormData(e.currentTarget))
    setSaving(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setOpen(false)
    router.refresh()
  }

  // Default to tomorrow at 7pm
  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 1)
  defaultDate.setHours(19, 0, 0, 0)
  const defaultDateTime = defaultDate.toISOString().slice(0, 16)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="famli-btn-primary flex items-center gap-1.5 text-sm px-4 py-2.5"
      >
        <Plus className="w-4 h-4" />
        Plan meal
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 animate-slide-up h-[85dvh] overflow-y-auto overscroll-contain touch-pan-y">
            <div className="flex items-center justify-between mb-5 sticky top-0 bg-white z-10 pb-2">
              <h2 className="text-lg font-bold text-stone-900">Plan a Family Meal</h2>
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
                <label className="famli-label">Title</label>
                <input
                  name="title"
                  type="text"
                  required
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
                  defaultValue={defaultDateTime}
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
                  "Plan this meal 🍽️"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}