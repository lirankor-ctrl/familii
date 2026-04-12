import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      familyId: string | null
      familyRole: string | null
      onboardingDone: boolean
    } & DefaultSession["user"]
  }

  interface User {
    familyId?: string | null
    familyRole?: string | null
    onboardingDone?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    familyId?: string | null
    familyRole?: string | null
    onboardingDone?: boolean
  }
}
