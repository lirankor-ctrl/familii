import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { Heart, Users, Cake, Utensils, MessageCircle, Star } from "lucide-react"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.id) {
    if (!session.user.onboardingDone) redirect("/onboarding")
    redirect("/dashboard")
  }

  const features = [
    { icon: Users, label: "Family Tree", desc: "See your whole family at a glance", color: "bg-blue-100 text-blue-600" },
    { icon: Heart, label: "Moments", desc: "Share photos and memories", color: "bg-rose-100 text-rose-600" },
    { icon: Cake, label: "Birthdays", desc: "Never miss a birthday again", color: "bg-pink-100 text-pink-600" },
    { icon: Utensils, label: "Family Meals", desc: "Plan gatherings and dinners", color: "bg-amber-100 text-amber-600" },
    { icon: Star, label: "Experiences", desc: "Share your life stories", color: "bg-purple-100 text-purple-600" },
    { icon: MessageCircle, label: "Messages", desc: "Stay in touch every day", color: "bg-green-100 text-green-600" },
  ]

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏡</span>
          <span className="text-xl font-bold text-famli-600">Famli</span>
        </div>
        <Link href="/login" className="famli-btn-ghost text-sm">
          Log in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-8">
        <div className="animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce-gentle">🏡</div>
          <h1 className="text-4xl font-extrabold text-stone-900 mb-4 leading-tight">
            Your family,{" "}
            <span className="text-famli-500">together</span>
          </h1>
          <p className="text-stone-500 text-lg mb-8 max-w-xs mx-auto leading-relaxed">
            A private, warm space for your family to share moments, celebrate each other, and stay close.
          </p>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Link href="/signup" className="famli-btn-primary text-center text-base">
              Create your family space
            </Link>
            <Link href="/login" className="famli-btn-secondary text-center text-base">
              I already have an account
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-16 w-full max-w-sm">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-6">
            Everything your family needs
          </p>
          <div className="grid grid-cols-3 gap-3">
            {features.map(({ icon: Icon, label, desc, color }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-3 shadow-card flex flex-col items-center text-center gap-2"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-stone-700 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 text-xs text-stone-400">
          Private. Ad-free. Just for your family. 💛
        </p>
      </main>
    </div>
  )
}
