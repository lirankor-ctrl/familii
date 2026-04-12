import Image from "next/image"
import { timeAgo, initials, familyRoleEmoji, familyRoleLabel } from "@/lib/utils"
import type { ExperienceWithAuthor } from "@/types"

interface ExperienceCardProps {
  experience: ExperienceWithAuthor
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <div className="famli-card overflow-hidden">
      {/* Author header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-warm-sm shrink-0">
          {experience.author.profileImage ? (
            <Image
              src={experience.author.profileImage}
              alt={experience.author.firstName}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-famli-100 flex items-center justify-center text-famli-600 font-bold text-sm">
              {experience.author.firstName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-stone-900 text-sm">{experience.author.firstName}</p>
          <div className="flex items-center gap-1 text-xs text-stone-400">
            {experience.author.familyRole && (
              <span>
                {familyRoleEmoji(experience.author.familyRole)}{" "}
                {familyRoleLabel(experience.author.familyRole)}
              </span>
            )}
            <span>·</span>
            <span>{timeAgo(experience.createdAt)}</span>
          </div>
        </div>
        <span className="text-xl">✨</span>
      </div>

      {/* Optional image */}
      {experience.imageUrl && (
        <div className="relative w-full aspect-[16/9] bg-orange-50">
          <Image
            src={experience.imageUrl}
            alt={experience.title ?? "Experience"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 pt-3">
        {experience.title && (
          <h3 className="font-bold text-stone-900 text-base mb-2">{experience.title}</h3>
        )}
        <p className="text-stone-700 text-sm leading-relaxed">{experience.content}</p>
      </div>
    </div>
  )
}
