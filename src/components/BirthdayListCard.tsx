"use client"

import Image from "next/image"
import { useState } from "react"
import { formatDate, initials, getAge } from "@/lib/utils"
import { sendBirthdayWishAction } from "@/actions/birthdays"
import type { BirthdayEntry } from "@/types"
import { cn } from "@/lib/utils"
import { Heart, Send } from "lucide-react"

interface BirthdayListCardProps {
  entry: BirthdayEntry
  currentUserId: string
  isToday?: boolean
}

export function BirthdayListCard({ entry, currentUserId, isToday = false }: BirthdayListCardProps) {
  const { user, daysUntil, nextBirthday, age, wishes } = entry
  const [showWishForm, setShowWishForm] = useState(false)
  const [wishText, setWishText] = useState("")
  const [sending, setSending] = useState(false)
  const [localWishes, setLocalWishes] = useState(wishes)

  const alreadySentWish = localWishes.some((w) => w.fromUserId === currentUserId)
  const isOwnBirthday = user.id === currentUserId

  async function handleSendWish() {
    if (!wishText.trim()) return
    setSending(true)

    const fd = new FormData()
    fd.append("message", wishText)
    fd.append("toUserId", user.id)
    const result = await sendBirthdayWishAction(fd)

    setSending(false)
    if (result.success) {
      setLocalWishes((prev) => {
        const without = prev.filter((w) => w.fromUserId !== currentUserId)
        return [...without, result.data]
      })
      setWishText("")
      setShowWishForm(false)
    }
  }

  return (
    <div className={cn("famli-card overflow-hidden", isToday && "ring-2 ring-pink-300")}>
      <div className="p-4">
        {/* Member info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-warm-sm shrink-0">
            {user.profileImage ? (
              <Image src={user.profileImage} alt={user.firstName} width={48} height={48} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-famli-100 flex items-center justify-center text-famli-600 font-bold">
                {initials(user.firstName, user.lastName)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-stone-900">{user.firstName} {user.lastName}</h3>
              {isToday && (
                <span className="text-xs bg-pink-100 text-pink-600 font-semibold px-2 py-0.5 rounded-full">
                  🎂 Today!
                </span>
              )}
            </div>
            <p className="text-sm text-stone-500">
              {formatDate(nextBirthday, "MMMM d")} · Turning {age + 1}
              {!isToday && ` · ${daysUntil} day${daysUntil !== 1 ? "s" : ""} away`}
            </p>
          </div>
        </div>

        {/* Wishes */}
        {localWishes.length > 0 && (
          <div className="bg-pink-50 rounded-2xl p-3 mb-3 flex flex-col gap-2">
            {localWishes.map((wish) => (
              <div key={wish.id} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-famli-100">
                  {wish.fromUser.profileImage ? (
                    <Image src={wish.fromUser.profileImage} alt="" width={24} height={24} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-famli-600 text-xs font-bold">
                      {wish.fromUser.firstName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold text-stone-600">{wish.fromUser.firstName}: </span>
                  <span className="text-xs text-stone-600">{wish.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {!isOwnBirthday && (
          <div className="flex items-center gap-2">
            {!showWishForm ? (
              <button
                onClick={() => setShowWishForm(true)}
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all",
                  alreadySentWish
                    ? "bg-pink-100 text-pink-600"
                    : "bg-famli-50 text-famli-600 hover:bg-famli-100"
                )}
              >
                <Heart className={cn("w-4 h-4", alreadySentWish && "fill-current")} />
                {alreadySentWish ? "Edit wish" : "Send wish"}
              </button>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  placeholder={`Happy birthday, ${user.firstName}! 🎂`}
                  className="famli-input text-sm flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleSendWish()}
                  autoFocus
                />
                <button
                  onClick={handleSendWish}
                  disabled={!wishText.trim() || sending}
                  className="famli-btn-primary p-2.5 rounded-xl"
                >
                  {sending ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setShowWishForm(false)}
                  className="text-stone-400 hover:text-stone-600 p-2"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
