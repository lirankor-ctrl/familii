"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { updateProfileAction } from "@/actions/profile"
import { ImageUploader } from "./ImageUploader"
import { Edit3, Save } from "lucide-react"

const FAMILY_ROLES = [
  { value: "FATHER", label: "Father", emoji: "👨" },
  { value: "MOTHER", label: "Mother", emoji: "👩" },
  { value: "SON", label: "Son", emoji: "👦" },
  { value: "DAUGHTER", label: "Daughter", emoji: "👧" },
  { value: "BROTHER", label: "Brother", emoji: "👦" },
  { value: "SISTER", label: "Sister", emoji: "👧" },
  { value: "GRANDFATHER", label: "Grandfather", emoji: "👴" },
  { value: "GRANDMOTHER", label: "Grandmother", emoji: "👵" },
  { value: "OTHER", label: "Other", emoji: "🧑" },
]

interface ProfileEditorProps {
  user: {
    firstName: string
    lastName: string | null
    dateOfBirth: Date | null
    profileImage: string | null
    familyRole: string | null
  }
}

export function ProfileEditor({ user }: ProfileEditorProps) {
  const router = useRouter()
  const { update } = useSession()
  const [open, setOpen] = useState(false)
  const [profileImage, setProfileImage] = useState(user.profileImage ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const dobValue = user.dateOfBirth
    ? new Date(user.dateOfBirth).toISOString().split("T")[0]
    : ""

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSaving(true)

    const fd = new FormData(e.currentTarget)
    if (profileImage) fd.set("profileImage", profileImage)

    const result = await updateProfileAction(fd)
    setSaving(false)

    if (!result.success) { setError(result.error); return }

    if (result.data.profileImage) {
      await update({ image: result.data.profileImage })
    }

    setSuccess(true)
    setOpen(false)
    router.refresh()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <>
      {success && (
        <div className="bg-green-50 border border-green-100 text-green-600 text-sm px-4 py-3 rounded-2xl mb-4 text-center">
          ✅ Profile updated!
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="famli-btn-secondary w-full flex items-center justify-center gap-2"
      >
        <Edit3 className="w-4 h-4" />
        Edit profile
      </button>

      {open && (
        <div className="famli-card p-5 mt-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="famli-label">Profile photo</label>
              <ImageUploader
                currentImage={profileImage}
                onUpload={setProfileImage}
                folder="famli/profiles"
                size="md"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="famli-label">First name</label>
                <input name="firstName" type="text" defaultValue={user.firstName} required className="famli-input" />
              </div>
              <div>
                <label className="famli-label">Last name</label>
                <input name="lastName" type="text" defaultValue={user.lastName ?? ""} className="famli-input" />
              </div>
            </div>

            <div>
              <label className="famli-label">Date of birth</label>
              <input name="dateOfBirth" type="date" defaultValue={dobValue} className="famli-input" max={new Date().toISOString().split("T")[0]} />
            </div>

            <div>
              <label className="famli-label">Family role</label>
              <select name="familyRole" defaultValue={user.familyRole ?? ""} className="famli-input">
                <option value="">Select role...</option>
                {FAMILY_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.emoji} {r.label}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setOpen(false)} className="famli-btn-ghost flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="famli-btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Save className="w-4 h-4" /> Save</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
