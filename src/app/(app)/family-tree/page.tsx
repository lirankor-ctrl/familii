import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getFamilyWithMembers, getOrCreateInviteCode } from "@/actions/family"
import { FamilyMemberCard } from "@/components/FamilyMemberCard"
import { EmptyState } from "@/components/EmptyState"
import { InviteCodeCard } from "@/components/InviteCodeCard"
import { familyRoleEmoji } from "@/lib/utils"
import type { FamilyRole } from "@prisma/client"

// Define the visual hierarchy for the family tree
const ROLE_TIERS: Record<string, number> = {
  GRANDFATHER: 0,
  GRANDMOTHER: 0,
  FATHER: 1,
  MOTHER: 1,
  SON: 2,
  DAUGHTER: 2,
  BROTHER: 2,
  SISTER: 2,
  OTHER: 2,
}

export default async function FamilyTreePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.familyId) redirect("/onboarding")

  const [family, inviteResult] = await Promise.all([
    getFamilyWithMembers(session.user.familyId),
    getOrCreateInviteCode(session.user.familyId),
  ])

  if (!family) redirect("/onboarding")

  // Group members by tier
  const tiers: { label: string; members: typeof family.members }[] = [
    { label: "Grandparents", members: [] },
    { label: "Parents", members: [] },
    { label: "Children", members: [] },
  ]

  family.members.forEach((member) => {
    const tier = ROLE_TIERS[member.familyRole ?? "OTHER"] ?? 2
    tiers[tier].members.push(member)
  })

  const hasGrandparents = tiers[0].members.length > 0
  const inviteCode = inviteResult.success ? inviteResult.data.code : null

  return (
    <div className="page-container pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-stone-900">
          {family.emoji} {family.name}
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {family.members.length} family member{family.members.length !== 1 ? "s" : ""}
        </p>
      </div>

      {family.members.length === 0 ? (
        <EmptyState
          emoji="👨‍👩‍👧‍👦"
          title="Your family is just getting started"
          description="Share the invite code below to add family members."
        />
      ) : (
        <div className="mb-8">
          {/* Visual tree */}
          {hasGrandparents && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                👴👵 Grandparents
              </p>
              <div className="flex flex-col gap-3">
                {tiers[0].members.map((member) => (
                  <FamilyMemberCard
                    key={member.id}
                    member={member}
                    isCurrentUser={member.id === session.user.id}
                  />
                ))}
              </div>
              {/* Connector line */}
              <div className="flex justify-center my-3">
                <div className="w-0.5 h-6 bg-orange-200" />
              </div>
            </div>
          )}

          {/* Parents */}
          {tiers[1].members.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                👨👩 Parents
              </p>
              <div className="grid grid-cols-2 gap-3">
                {tiers[1].members.map((member) => (
                  <FamilyMemberCard
                    key={member.id}
                    member={member}
                    isCurrentUser={member.id === session.user.id}
                    compact
                  />
                ))}
              </div>
              {/* Connector line */}
              {tiers[2].members.length > 0 && (
                <div className="flex justify-center my-3">
                  <div className="w-0.5 h-6 bg-orange-200" />
                </div>
              )}
            </div>
          )}

          {/* Children */}
          {tiers[2].members.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                👦👧 Children
              </p>
              <div className="flex flex-col gap-3">
                {tiers[2].members.map((member) => (
                  <FamilyMemberCard
                    key={member.id}
                    member={member}
                    isCurrentUser={member.id === session.user.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invite code */}
      {inviteCode && (
        <div className="mb-8">
          <InviteCodeCard code={inviteCode} familyName={family.name} />
        </div>
      )}
    </div>
  )
}
