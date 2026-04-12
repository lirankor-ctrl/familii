import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        if (!user) {
          throw new Error("No account found with this email")
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) {
          throw new Error("Invalid password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.firstName,
          image: user.profileImage ?? null,
          familyId: user.familyId ?? null,
          familyRole: user.familyRole ?? null,
          onboardingDone: user.onboardingDone,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        // These properties are added via next-auth.d.ts augmentation
        token.familyId = user.familyId ?? null
        token.familyRole = user.familyRole ?? null
        token.onboardingDone = user.onboardingDone ?? false
      }
      if (trigger === "update" && session) {
        if (session.familyId !== undefined) token.familyId = session.familyId
        if (session.familyRole !== undefined) token.familyRole = session.familyRole
        if (session.onboardingDone !== undefined) token.onboardingDone = session.onboardingDone
        if (session.image !== undefined) token.picture = session.image
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.familyId = token.familyId ?? null
        session.user.familyRole = token.familyRole ?? null
        session.user.onboardingDone = token.onboardingDone ?? false
      }
      return session
    },
  },
}
