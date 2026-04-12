"use client"

import Image from "next/image"
import { useState } from "react"
import { format } from "date-fns"
import { MapPin, Calendar, Users, CheckCircle, XCircle, HelpCircle } from "lucide-react"
import { rsvpMealAction } from "@/actions/meals"
import type { MealWithRSVPs } from "@/types"
import type { RSVPStatus } from "@prisma/client"
import { initials, familyRoleEmoji } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface MealCardProps {
  meal: MealWithRSVPs
  currentUserId: string
  past?: boolean
}

const RSVP_OPTIONS: { status: RSVPStatus; label: string; icon: typeof CheckCircle; color: string }[] = [
  { status: "GOING", label: "Going", icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200" },
  { status: "MAYBE", label: "Maybe", icon: HelpCircle, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { status: "NOT_GOING", label: "Can't go", icon: XCircle, color: "text-red-500 bg-red-50 border-red-200" },
]

export function MealCard({ meal, currentUserId, past = false }: MealCardProps) {
  const myRsvp = meal.rsvps.find((r) => r.userId === currentUserId)
  const [currentStatus, setCurrentStatus] = useState<RSVPStatus | null>(myRsvp?.status ?? null)
  const [saving, setSaving] = useState(false)

  const goingCount = meal.rsvps.filter((r) => r.status === "GOING").length
  const maybeCount = meal.rsvps.filter((r) => r.status === "MAYBE").length

  async function handleRsvp(status: RSVPStatus) {
    if (past) return
    setSaving(true)
    setCurrentStatus(status)
    await rsvpMealAction(meal.id, status)
    setSaving(false)
  }

  return (
    <div className={cn("famli-card overflow-hidden", past && "opacity-70")}>
      <div className="p-5">
        {/* Title + date */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-stone-900 text-base">{meal.title}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-stone-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(new Date(meal.scheduledAt), "EEEE, MMMM d 'at' h:mm a")}</span>
            </div>
            {meal.location && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-stone-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>{meal.location}</span>
              </div>
            )}
          </div>
          <span className="text-2xl ml-2">🍽️</span>
        </div>

        {meal.notes && (
          <p className="text-sm text-stone-600 bg-orange-50 rounded-xl p-3 mb-4">
            {meal.notes}
          </p>
        )}

        {/* RSVP summary */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex -space-x-1.5">
            {meal.rsvps
              .filter((r) => r.status === "GOING")
              .slice(0, 4)
              .map((r) => (
                <div
                  key={r.userId}
                  className="w-7 h-7 rounded-full bg-famli-100 ring-2 ring-white flex items-center justify-center text-xs font-bold text-famli-600 overflow-hidden"
                >
                  {r.user.profileImage ? (
                    <Image src={r.user.profileImage} alt="" width={28} height={28} className="object-cover" />
                  ) : (
                    initials(r.user.firstName, r.user.lastName)
                  )}
                </div>
              ))}
          </div>
          <p className="text-xs text-stone-500 font-medium">
            {goingCount} going{maybeCount > 0 ? ` · ${maybeCount} maybe` : ""}
          </p>
        </div>

        {/* RSVP buttons */}
        {!past && (
          <div className="flex gap-2">
            {RSVP_OPTIONS.map(({ status, label, icon: Icon, color }) => (
              <button
                key={status}
                onClick={() => handleRsvp(status)}
                disabled={saving}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all",
                  currentStatus === status
                    ? color + " border-current"
                    : "bg-gray-50 border-gray-200 text-stone-500 hover:bg-gray-100",
                  saving && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        )}

        {past && (
          <p className="text-xs text-stone-400 font-medium">Past meal · {goingCount} attended</p>
        )}
      </div>
    </div>
  )
}
