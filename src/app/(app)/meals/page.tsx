import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getMeals } from "@/actions/meals"
import { MealCard } from "@/components/MealCard"
import { EmptyState } from "@/components/EmptyState"
import { AddMealButton } from "@/components/AddMealButton"

export default async function MealsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.familyId) redirect("/onboarding")

  const meals = await getMeals(session.user.familyId)
  const now = new Date()

  const upcoming = meals.filter((m) => new Date(m.scheduledAt) >= now)
  const past = meals.filter((m) => new Date(m.scheduledAt) < now)

  return (
    <div className="page-container pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">Family Meals 🍽️</h1>
          <p className="text-stone-500 text-sm mt-0.5">Plan dinners and gatherings together</p>
        </div>
        <AddMealButton />
      </div>

      {meals.length === 0 ? (
        <EmptyState
          emoji="🍽️"
          title="No meals planned yet"
          description="Plan your next family dinner or gathering!"
          cta="Plan a meal"
        />
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Upcoming
              </p>
              <div className="feed-gap">
                {upcoming.map((meal) => (
                  <MealCard key={meal.id} meal={meal} currentUserId={session.user.id} />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Past meals
              </p>
              <div className="feed-gap">
                {past.slice(0, 5).map((meal) => (
                  <MealCard key={meal.id} meal={meal} currentUserId={session.user.id} past />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
