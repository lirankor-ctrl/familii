import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")
  if (session.user.onboardingDone) redirect("/dashboard")

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      <header className="flex items-center px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏡</span>
          <span className="text-xl font-bold text-famli-600">Famli</span>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
