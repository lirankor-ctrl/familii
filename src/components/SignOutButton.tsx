"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl border-2 border-red-100 text-red-500 font-semibold text-sm hover:bg-red-50 transition-all active:scale-[0.98]"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  )
}
