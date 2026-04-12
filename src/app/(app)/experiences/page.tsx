import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getExperiences } from "@/actions/experiences"
import { ExperienceCard } from "@/components/ExperienceCard"
import { EmptyState } from "@/components/EmptyState"
import { AddExperienceButton } from "@/components/AddExperienceButton"

export default async function ExperiencesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.familyId) redirect("/onboarding")

  const experiences = await getExperiences(session.user.familyId)

  return (
    <div className="page-container pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">Experiences ✨</h1>
          <p className="text-stone-500 text-sm mt-0.5">Life stories, big moments, daily wins</p>
        </div>
        <AddExperienceButton />
      </div>

      {experiences.length === 0 ? (
        <EmptyState
          emoji="✨"
          title="No stories yet"
          description="Share something meaningful — a trip, a win, a thought."
          cta="Share a story"
        />
      ) : (
        <div className="feed-gap">
          {experiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      )}
    </div>
  )
}
