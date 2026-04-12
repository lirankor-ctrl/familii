import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { BottomNav } from "@/components/BottomNav"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) redirect("/login")
  if (!session.user.onboardingDone) redirect("/onboarding")

  return (
    <div className="min-h-screen bg-famli-cream">
      {/* Top safe area */}
      <div className="safe-top" />
      {/* Page content */}
      <main>{children}</main>
      {/* Bottom nav */}
      <BottomNav />
    </div>
  )
}
