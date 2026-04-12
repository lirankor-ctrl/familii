import Image from "next/image"
import { familyRoleLabel, familyRoleEmoji, getAge, isBirthdayToday, daysUntilBirthday, cn } from "@/lib/utils"
import type { PublicUser } from "@/types"

interface FamilyMemberCardProps {
  member: PublicUser
  compact?: boolean
  isCurrentUser?: boolean
}

export function FamilyMemberCard({ member, compact = false, isCurrentUser = false }: FamilyMemberCardProps) {
  const birthdayToday = member.dateOfBirth ? isBirthdayToday(member.dateOfBirth) : false
  const daysUntil = member.dateOfBirth ? daysUntilBirthday(member.dateOfBirth) : null

  if (compact) {
    return (
      <div
        className={cn(
          "famli-card p-4 flex flex-col items-center gap-2 text-center",
          isCurrentUser && "ring-2 ring-famli-300"
        )}
      >
        {/* Avatar */}
        <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-warm-sm">
          {member.profileImage ? (
            <Image src={member.profileImage} alt={member.firstName} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-famli-100 flex items-center justify-center text-famli-600 font-bold text-xl">
              {member.firstName.charAt(0)}
            </div>
          )}
          {birthdayToday && (
            <div className="absolute -top-1 -right-1 text-base">🎂</div>
          )}
        </div>

        <div>
          <p className="font-semibold text-stone-900 text-sm">
            {member.firstName}
            {isCurrentUser && <span className="text-famli-400 text-xs ml-1">(you)</span>}
          </p>
          {member.familyRole && (
            <p className="text-xs text-stone-500">
              {familyRoleEmoji(member.familyRole)} {familyRoleLabel(member.familyRole)}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "famli-card p-4 flex items-center gap-4",
        isCurrentUser && "ring-2 ring-famli-300"
      )}
    >
      {/* Avatar */}
      <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-warm-sm shrink-0">
        {member.profileImage ? (
          <Image src={member.profileImage} alt={member.firstName} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-famli-100 flex items-center justify-center text-famli-600 font-bold text-xl">
            {member.firstName.charAt(0)}
          </div>
        )}
        {birthdayToday && (
          <div className="absolute -top-1 -right-1 text-base">🎂</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-stone-900">
            {member.firstName} {member.lastName}
          </h3>
          {isCurrentUser && (
            <span className="text-xs bg-famli-100 text-famli-600 font-semibold px-2 py-0.5 rounded-full">
              You
            </span>
          )}
          {birthdayToday && (
            <span className="text-xs bg-pink-100 text-pink-600 font-semibold px-2 py-0.5 rounded-full">
              🎂 Birthday!
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {member.familyRole && (
            <span className="text-sm text-stone-500">
              {familyRoleEmoji(member.familyRole)} {familyRoleLabel(member.familyRole)}
            </span>
          )}
          {member.dateOfBirth && (
            <span className="text-sm text-stone-400">
              Age {getAge(member.dateOfBirth)}
            </span>
          )}
        </div>

        {member.dateOfBirth && daysUntil !== null && !birthdayToday && daysUntil <= 30 && (
          <p className="text-xs text-famli-500 font-medium mt-1">
            🎂 Birthday in {daysUntil} day{daysUntil !== 1 ? "s" : ""}!
          </p>
        )}
      </div>
    </div>
  )
}
