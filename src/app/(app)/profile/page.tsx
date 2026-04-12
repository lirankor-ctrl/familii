import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/actions/profile"
import { ProfileEditor } from "@/components/ProfileEditor"
import { SignOutButton } from "@/components/SignOutButton"
import { formatDate, familyRoleLabel, familyRoleEmoji, getAge } from "@/lib/utils"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <div className="page-container pt-6">
      <h1 className="text-2xl font-extrabold text-stone-900 mb-6">Profile 👤</h1>

      {/* Profile card */}
      <div className="famli-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-famli-100 shrink-0">
            {user.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user.firstName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-famli-100 flex items-center justify-center text-famli-600 font-bold text-3xl">
                {user.firstName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {user.firstName} {user.lastName}
            </h2>
            {user.familyRole && (
              <p className="text-stone-500 text-sm mt-0.5">
                {familyRoleEmoji(user.familyRole)} {familyRoleLabel(user.familyRole)}
              </p>
            )}
            {user.family && (
              <p className="text-famli-500 text-sm font-semibold mt-0.5">
                {user.family.emoji} {user.family.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-0 text-sm">
          <div className="flex items-center justify-between py-2.5 border-b border-orange-50">
            <span className="text-stone-500 font-medium">Email</span>
            <span className="text-stone-700 font-semibold">{user.email}</span>
          </div>
          {user.dateOfBirth && (
            <>
              <div className="flex items-center justify-between py-2.5 border-b border-orange-50">
                <span className="text-stone-500 font-medium">Birthday</span>
                <span className="text-stone-700 font-semibold">
                  {formatDate(user.dateOfBirth, "MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-stone-500 font-medium">Age</span>
                <span className="text-stone-700 font-semibold">
                  {getAge(user.dateOfBirth)} years old
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit form */}
      <ProfileEditor user={user} />

      {/* Sign out */}
      <div className="mt-6 mb-8">
        <SignOutButton />
      </div>
    </div>
  )
}
