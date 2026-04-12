import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getBirthdayEntries } from "@/actions/birthdays"
import { BirthdayCountdownCard } from "@/components/BirthdayCountdownCard"
import { BirthdayListCard } from "@/components/BirthdayListCard"
import { EmptyState } from "@/components/EmptyState"

export default async function BirthdaysPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.familyId) redirect("/onboarding")

  const entries = await getBirthdayEntries(session.user.familyId)
  const todayEntries = entries.filter((e) => e.isToday)
  const upcomingEntries = entries.filter((e) => !e.isToday)

  return (
    <div className="page-container pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-stone-900">Birthdays 🎂</h1>
        <p className="text-stone-500 text-sm mt-0.5">Celebrate every member of your family</p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          emoji="🎂"
          title="No birthdays yet"
          description="Family members can add their birth dates in their profiles."
        />
      ) : (
        <>
          {/* Today's birthdays */}
          {todayEntries.length > 0 && (
            <div className="mb-8">
              <div className="bg-gradient-pink rounded-3xl p-5 mb-4 text-white">
                <div className="text-3xl mb-1">🥳</div>
                <h2 className="text-xl font-bold">
                  {todayEntries.map((e) => e.user.firstName).join(" & ")}&apos;s Birthday!
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Today is a special day — send your love!
                </p>
              </div>
              <div className="feed-gap">
                {todayEntries.map((entry) => (
                  <BirthdayListCard
                    key={entry.user.id}
                    entry={entry}
                    currentUserId={session.user.id}
                    isToday
                  />
                ))}
              </div>
            </div>
          )}

          {/* Next birthday hero card */}
          {upcomingEntries.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Coming up next
              </p>
              <BirthdayCountdownCard entry={upcomingEntries[0]} large />
            </div>
          )}

          {/* All birthdays list */}
          {upcomingEntries.length > 1 && (
            <div className="mb-8">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                All birthdays
              </p>
              <div className="feed-gap">
                {upcomingEntries.map((entry) => (
                  <BirthdayListCard
                    key={entry.user.id}
                    entry={entry}
                    currentUserId={session.user.id}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
