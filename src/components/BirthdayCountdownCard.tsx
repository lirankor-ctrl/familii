import Image from "next/image"
import { formatDate, initials } from "@/lib/utils"
import type { BirthdayEntry } from "@/types"
import { cn } from "@/lib/utils"

interface BirthdayCountdownCardProps {
  entry: BirthdayEntry
  large?: boolean
}

export function BirthdayCountdownCard({ entry, large = false }: BirthdayCountdownCardProps) {
  const { user, daysUntil, nextBirthday, age } = entry

  const countdownText =
    daysUntil === 0
      ? "Today! 🎉"
      : daysUntil === 1
      ? "Tomorrow! 🎂"
      : `In ${daysUntil} days`

  const urgencyColor =
    daysUntil <= 1
      ? "bg-gradient-pink text-white"
      : daysUntil <= 7
      ? "bg-amber-50 border-2 border-amber-200"
      : "bg-white border border-orange-100"

  return (
    <div className={cn("rounded-3xl p-5 shadow-card", urgencyColor, large && "p-6")}>
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={cn(
            "rounded-full overflow-hidden ring-2 shrink-0",
            daysUntil <= 1 ? "ring-white/50" : "ring-white",
            large ? "w-20 h-20" : "w-14 h-14"
          )}
        >
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={user.firstName}
              width={large ? 80 : 56}
              height={large ? 80 : 56}
              className="object-cover w-full h-full"
            />
          ) : (
            <div
              className={cn(
                "w-full h-full flex items-center justify-center font-bold",
                daysUntil <= 1 ? "bg-white/20 text-white" : "bg-famli-100 text-famli-600",
                large ? "text-3xl" : "text-xl"
              )}
            >
              {initials(user.firstName, user.lastName)}
            </div>
          )}
        </div>

        <div className="flex-1">
          <p
            className={cn(
              "font-bold",
              daysUntil <= 1 ? "text-white" : "text-stone-900",
              large ? "text-xl" : "text-base"
            )}
          >
            {user.firstName}&apos;s Birthday
          </p>

          <p className={cn("text-sm mt-0.5", daysUntil <= 1 ? "text-white/80" : "text-stone-500")}>
            {formatDate(nextBirthday, "MMMM d")} · Turning {age + 1}
          </p>

          <div className="mt-2">
            <span
              className={cn(
                "text-sm font-bold px-3 py-1 rounded-full inline-block",
                daysUntil <= 1
                  ? "bg-white/20 text-white"
                  : daysUntil <= 7
                  ? "bg-amber-100 text-amber-700"
                  : "bg-famli-100 text-famli-700"
              )}
            >
              🎂 {countdownText}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar (for large variant) */}
      {large && daysUntil > 0 && daysUntil <= 365 && (
        <div className="mt-4">
          <div
            className={cn(
              "h-1.5 rounded-full overflow-hidden",
              daysUntil <= 1 ? "bg-white/20" : "bg-orange-100"
            )}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                daysUntil <= 1 ? "bg-white" : "bg-famli-400"
              )}
              style={{ width: `${Math.max(5, 100 - (daysUntil / 365) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
