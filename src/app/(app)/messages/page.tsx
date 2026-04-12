import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getMessages } from "@/actions/messages"
import { MessageFeed } from "@/components/MessageFeed"

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.familyId) redirect("/onboarding")

  const messages = await getMessages(session.user.familyId)

  return (
    <div className="page-container pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-stone-900">Messages 💬</h1>
        <p className="text-stone-500 text-sm mt-0.5">Your family message board</p>
      </div>

      {/* MessageFeed handles pinned/regular split, empty state, and the composer */}
      <MessageFeed
        initialMessages={messages}
        currentUserId={session.user.id}
      />
    </div>
  )
}
