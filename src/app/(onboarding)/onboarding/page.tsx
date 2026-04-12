"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { createFamilyAction, joinFamilyAction } from "@/actions/family"
import { ImageUploader } from "@/components/ImageUploader"
import { Users, PlusCircle, ArrowRight, ChevronLeft } from "lucide-react"

type Step = "choose" | "create" | "join" | "profile"
type Mode = "create" | "join"

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

export default function OnboardingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const [step, setStep] = useState<Step>("choose")
  const [mode, setMode] = useState<Mode>("create")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [familyName, setFamilyName] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [profileImage, setProfileImage] = useState("")

  async function handleFinish() {
    if (!selectedRole) {
      setError("Please select your role in the family")
      return
    }
    setError("")
    setLoading(true)

    const formData = new FormData()
    formData.append("familyRole", selectedRole)
    if (dateOfBirth) formData.append("dateOfBirth", dateOfBirth)
    if (profileImage) formData.append("profileImage", profileImage)

    let result
    if (mode === "create") {
      formData.append("familyName", familyName)
      result = await createFamilyAction(formData)
    } else {
      formData.append("inviteCode", inviteCode)
      result = await joinFamilyAction(formData)
    }

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    // Update session to reflect new familyId and onboarding status
    await update({
      familyId: result.data.familyId,
      familyRole: selectedRole,
      onboardingDone: true,
    })

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="animate-fade-in">
      {/* Step: Choose */}
      {step === "choose" && (
        <>
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">👨‍👩‍👧‍👦</div>
            <h1 className="text-2xl font-bold text-stone-900">Set up your family</h1>
            <p className="text-stone-500 text-sm mt-1">
              Create a new family space or join an existing one
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setMode("create"); setStep("create") }}
              className="famli-card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all text-left"
            >
              <div className="w-12 h-12 bg-famli-100 rounded-2xl flex items-center justify-center shrink-0">
                <PlusCircle className="w-6 h-6 text-famli-600" />
              </div>
              <div>
                <p className="font-semibold text-stone-900">Create a new family</p>
                <p className="text-sm text-stone-500 mt-0.5">Start fresh and invite your family</p>
              </div>
            </button>

            <button
              onClick={() => { setMode("join"); setStep("join") }}
              className="famli-card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all text-left"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-stone-900">Join an existing family</p>
                <p className="text-sm text-stone-500 mt-0.5">Enter an invite code from a family member</p>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Step: Create family name */}
      {step === "create" && (
        <>
          <button onClick={() => setStep("choose")} className="famli-btn-ghost flex items-center gap-1 mb-6 -ml-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏡</div>
            <h1 className="text-2xl font-bold text-stone-900">Name your family</h1>
            <p className="text-stone-500 text-sm mt-1">This is how your space will be known</p>
          </div>
          <div className="famli-card p-6">
            <label className="famli-label">Family name</label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g. The Johnson Family"
              className="famli-input"
              maxLength={80}
            />
            <button
              onClick={() => {
                if (!familyName.trim()) { setError("Please enter a family name"); return }
                setError("")
                setStep("profile")
              }}
              disabled={!familyName.trim()}
              className="famli-btn-primary w-full flex items-center justify-center gap-2 mt-4"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
          </div>
        </>
      )}

      {/* Step: Join with invite code */}
      {step === "join" && (
        <>
          <button onClick={() => setStep("choose")} className="famli-btn-ghost flex items-center gap-1 mb-6 -ml-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔑</div>
            <h1 className="text-2xl font-bold text-stone-900">Enter invite code</h1>
            <p className="text-stone-500 text-sm mt-1">Ask a family member to share their invite code</p>
          </div>
          <div className="famli-card p-6">
            <label className="famli-label">Invite code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. JOHNSON-AB12"
              className="famli-input font-mono tracking-widest"
            />
            <button
              onClick={() => {
                if (!inviteCode.trim()) { setError("Please enter an invite code"); return }
                setError("")
                setStep("profile")
              }}
              disabled={!inviteCode.trim()}
              className="famli-btn-primary w-full flex items-center justify-center gap-2 mt-4"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
          </div>
        </>
      )}

      {/* Step: Profile */}
      {step === "profile" && (
        <>
          <button onClick={() => setStep(mode === "create" ? "create" : "join")} className="famli-btn-ghost flex items-center gap-1 mb-6 -ml-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🌟</div>
            <h1 className="text-2xl font-bold text-stone-900">Your profile</h1>
            <p className="text-stone-500 text-sm mt-1">Let your family know who you are</p>
          </div>

          <div className="famli-card p-6 flex flex-col gap-5">
            {/* Profile image */}
            <div>
              <label className="famli-label">Profile photo</label>
              <ImageUploader
                currentImage={profileImage}
                onUpload={(url) => setProfileImage(url)}
                folder="famli/profiles"
              />
            </div>

            {/* Role selector */}
            <div>
              <label className="famli-label">Your role in the family</label>
              <div className="grid grid-cols-3 gap-2">
                {FAMILY_ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-3 rounded-2xl text-center border-2 transition-all ${
                      selectedRole === role.value
                        ? "border-famli-500 bg-famli-50 shadow-warm-sm"
                        : "border-orange-100 bg-white hover:border-famli-200"
                    }`}
                  >
                    <div className="text-xl mb-1">{role.emoji}</div>
                    <div className="text-xs font-semibold text-stone-700">{role.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date of birth */}
            <div>
              <label className="famli-label">
                Date of birth <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="famli-input"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            <button
              onClick={handleFinish}
              disabled={loading || !selectedRole}
              className="famli-btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Let&apos;s go! 🎉
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
