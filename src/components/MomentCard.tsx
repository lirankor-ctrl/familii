import Image from "next/image"
import { timeAgo, familyRoleLabel, familyRoleEmoji, initials } from "@/lib/utils"
import type { MomentWithAuthor } from "@/types"
import { ShareButton } from "./ShareButton"

interface MomentCardProps {
  moment: MomentWithAuthor
}

export function MomentCard({ moment }: MomentCardProps) {
  return (
    <div className="famli-card overflow-hidden">
      {/* Author */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-warm-sm shrink-0">
          {moment.author.profileImage ? (
            <Image
              src={moment.author.profileImage}
              alt={moment.author.firstName}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-famli-100 flex items-center justify-center text-famli-600 font-bold text-sm">
              {initials(moment.author.firstName, moment.author.lastName)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-stone-900 text-sm">{moment.author.firstName}</p>
          <div className="flex items-center gap-1 text-xs text-stone-400">
            {moment.author.familyRole && (
              <span>{familyRoleEmoji(moment.author.familyRole)} {familyRoleLabel(moment.author.familyRole)}</span>
            )}
            <span>·</span>
            <span>{timeAgo(moment.createdAt)}</span>
          </div>
        </div>
        {moment.emoji && <span className="text-xl">{moment.emoji}</span>}
      </div>

      {/* Image */}
      {moment.imageUrl && (
        <div className="relative w-full aspect-[4/3] bg-orange-50">
          <Image
            src={moment.imageUrl}
            alt={moment.caption ?? "Family moment"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      )}

      {/* Caption + Share */}
      <div className="p-4 pt-3">
        {moment.caption && (
          <p className="text-stone-700 text-sm leading-relaxed">{moment.caption}</p>
        )}
        <div className="flex justify-end mt-2">
          {/* url is resolved client-side inside ShareButton */}
          <ShareButton text={moment.caption ?? "Check out this family moment!"} />
        </div>
      </div>
    </div>
  )
}
