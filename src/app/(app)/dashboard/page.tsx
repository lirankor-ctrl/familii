import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/actions/profile"
import { getFamilyWithMembers } from "@/actions/family"
import { getBirthdayEntries } from "@/actions/birthdays"
import { getMoments } from "@/actions/moments"
import { SectionHeader } from "@/components/SectionHeader"
import { BirthdayCountdownCard } from "@/components/BirthdayCountdownCard"
import { MomentCard } from "@/components/MomentCard"
import { FamilyMemberCard } from "@/components/FamilyMemberCard"
import { EmptyState } from "@/components/EmptyState"
import { Heart, Cake, Utensils, MessageCircle, Star, Users } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.familyId) redirect("/onboarding")

  const [user, family, birthdays, moments] = await Promise.all([
    getCurrentUser(),
    getFamilyWithMembers(session.user.familyId),
    getBirthdayEntries(session.user.familyId),
    getMoments(session.user.familyId),
  ])

  if (!user || !family) redirect("/onboarding")

  const nextBirthday = birthdays[0]
  const recentMoments = moments.slice(0, 3)
  const todayBirthdays = birthdays.filter((b) => b.isToday)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="page-container pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-stone-500 font-medium">{greeting} 👋</p>
          <h1 className="text-2xl font-extrabold text-stone-900">{user.firstName}</h1>
        </div>
        <Link
          href="/profile"
          className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-famli-200 ring-offset-1 shrink-0"
        >
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={user.firstName}
              width={44}
              height={44}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-famli-100 flex items-center justify-center text-famli-600 font-bold text-sm">
              {user.firstName.charAt(0)}
            </div>
          )}
        </Link>
      </div>

      {/* Today's birthday banner */}
      {todayBirthdays.length > 0 && (
        <div className="bg-gradient-pink rounded-3xl p-5 mb-6 text-white shadow-warm">
          <div className="text-3xl mb-1">🎂</div>
          <h2 className="text-lg font-bold">
            Happy Birthday, {todayBirthdays.map((b) => b.user.firstName).join(" & ")}!
          </h2>
          <p className="text-white/80 text-sm mt-1">Don&apos;t forget to send your wishes 💕</p>
          <Link
            href="/birthdays"
            className="mt-3 inline-block bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            Send wishes →
          </Link>
        </div>
      )}

      {/* Family banner */}
      <div className="bg-gradient-warm rounded-3xl p-5 mb-6 text-white shadow-warm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">
              Your Family
            </p>
            <h2 className="text-xl font-bold mt-0.5">
              {family.emoji} {family.name}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {family.members.length} member{family.members.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/family-tree"
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            View tree
          </Link>
        </div>
        <div className="flex mt-4 -space-x-2">
          {family.members.slice(0, 5).map((member) => (
            <div
              key={member.id}
              className="w-9 h-9 rounded-full ring-2 ring-white overflow-hidden bg-famli-100 shrink-0"
            >
              {member.profileImage ? (
                <Image
                  src={member.profileImage}
                  alt={member.firstName}
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-famli-700 font-bold text-xs">
                  {member.firstName.charAt(0)}
                </div>
              )}
            </div>
          ))}
          {family.members.length > 5 && (
            <div className="w-9 h-9 rounded-full ring-2 ring-white bg-famli-200 flex items-center justify-center text-famli-700 text-xs font-bold">
              +{family.members.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Quick nav grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { href: "/moments", icon: Heart, label: "Moments", color: "bg-rose-50 text-rose-500" },
          { href: "/birthdays", icon: Cake, label: "Birthdays", color: "bg-pink-50 text-pink-500" },
          { href: "/meals", icon: Utensils, label: "Meals", color: "bg-amber-50 text-amber-500" },
          { href: "/experiences", icon: Star, label: "Stories", color: "bg-purple-50 text-purple-500" },
          { href: "/messages", icon: MessageCircle, label: "Messages", color: "bg-green-50 text-green-500" },
          { href: "/family-tree", icon: Users, label: "Family", color: "bg-blue-50 text-blue-500" },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link
            key={href}
            href={href}
            className="famli-card p-4 flex flex-col items-center gap-2 hover:shadow-card-hover transition-all active:scale-[0.97]"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-600">{label}</span>
          </Link>
        ))}
      </div>

      {/* Upcoming birthday */}
      {nextBirthday && !nextBirthday.isToday && (
        <div className="mb-8">
          <SectionHeader title="Upcoming Birthday" icon="🎂" href="/birthdays" />
          <BirthdayCountdownCard entry={nextBirthday} />
        </div>
      )}

      {/* Recent moments */}
      <div className="mb-8">
        <SectionHeader title="Recent Moments" icon="📸" href="/moments" />
        {recentMoments.length === 0 ? (
          <EmptyState
            emoji="📸"
            title="No moments yet"
            description="Be the first to share a family moment!"
            href="/moments"
            cta="Add a moment"
          />
        ) : (
          <div className="feed-gap">
            {recentMoments.map((moment) => (
              <MomentCard key={moment.id} moment={moment} />
            ))}
          </div>
        )}
      </div>

      {/* Family members */}
      <div className="mb-8">
        <SectionHeader title="Family Members" icon="👨‍👩‍👧‍👦" href="/family-tree" />
        <div className="flex flex-col gap-3">
          {family.members.map((member) => (
            <FamilyMemberCard
              key={member.id}
              member={member}
              compact
              isCurrentUser={member.id === session.user.id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
