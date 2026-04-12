import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getMoments } from "@/actions/moments"
import { MomentCard } from "@/components/MomentCard"
import { EmptyState } from "@/components/EmptyState"
import { AddMomentButton } from "@/components/AddMomentButton"

export default async function MomentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.familyId) redirect("/onboarding")

  const moments = await getMoments(session.user.familyId)

  return (
    <div className="page-container pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">Moments 📸</h1>
          <p className="text-stone-500 text-sm mt-0.5">Family memories, big and small</p>
        </div>
        <AddMomentButton />
      </div>

      {moments.length === 0 ? (
        <EmptyState
          emoji="📷"
          title="No moments yet"
          description="Share your first family photo or memory!"
          cta="Share a moment"
        />
      ) : (
        <div className="feed-gap">
          {moments.map((moment) => (
            <MomentCard key={moment.id} moment={moment} />
          ))}
        </div>
      )}
    </div>
  )
}
