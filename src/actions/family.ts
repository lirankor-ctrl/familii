"use server"

import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateInviteCode } from "@/lib/utils"
import type { ActionResult, FamilyWithMembers } from "@/types"
import type { FamilyRole } from "@prisma/client"

// Shared role enum for validation — matches Prisma FamilyRole enum values exactly
const FAMILY_ROLES = [
  "FATHER",
  "MOTHER",
  "SON",
  "DAUGHTER",
  "BROTHER",
  "SISTER",
  "GRANDFATHER",
  "GRANDMOTHER",
  "OTHER",
] as const

// ─── Create Family ──────────────────────────────────────────────────────────────

const createFamilySchema = z.object({
  familyName: z.string().min(1, "Family name is required").max(80),
  familyRole: z.enum(FAMILY_ROLES, { errorMap: () => ({ message: "Please select a valid role" }) }),
  dateOfBirth: z.string().optional(),
  profileImage: z.string().url().optional().or(z.literal("")),
})

export async function createFamilyAction(
  formData: FormData
): Promise<ActionResult<{ familyId: string; inviteCode: string }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }

  const parsed = createFamilySchema.safeParse({
    familyName: formData.get("familyName"),
    familyRole: formData.get("familyRole"),
    dateOfBirth: (formData.get("dateOfBirth") as string) || undefined,
    profileImage: (formData.get("profileImage") as string) || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { familyName, familyRole, dateOfBirth, profileImage } = parsed.data

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { familyId: true },
    })
    if (existingUser?.familyId) {
      return { success: false, error: "You already belong to a family" }
    }

    // Create family first, then update user and invite in one transaction
    const family = await prisma.family.create({
      data: { name: familyName, emoji: "🏡" },
    })

    const inviteCode = generateInviteCode(familyName)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          familyId: family.id,
          familyRole: familyRole as FamilyRole,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          profileImage: profileImage || undefined,
          onboardingDone: true,
        },
      }),
      prisma.familyInvite.create({
        data: {
          code: inviteCode,
          familyId: family.id,
          createdById: session.user.id,
          maxUses: 20,
        },
      }),
    ])

    return { success: true, data: { familyId: family.id, inviteCode } }
  } catch (err) {
    console.error("[createFamilyAction]", err)
    return { success: false, error: "Failed to create family. Please try again." }
  }
}

// ─── Join Family ────────────────────────────────────────────────────────────────

const joinFamilySchema = z.object({
  inviteCode: z.string().min(3, "Invalid invite code"),
  familyRole: z.enum(FAMILY_ROLES, { errorMap: () => ({ message: "Please select a valid role" }) }),
  dateOfBirth: z.string().optional(),
  profileImage: z.string().url().optional().or(z.literal("")),
})

export async function joinFamilyAction(
  formData: FormData
): Promise<ActionResult<{ familyId: string; familyName: string }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }

  const parsed = joinFamilySchema.safeParse({
    inviteCode: formData.get("inviteCode"),
    familyRole: formData.get("familyRole"),
    dateOfBirth: (formData.get("dateOfBirth") as string) || undefined,
    profileImage: (formData.get("profileImage") as string) || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { inviteCode, familyRole, dateOfBirth, profileImage } = parsed.data

  try {
    const invite = await prisma.familyInvite.findUnique({
      where: { code: inviteCode.toUpperCase().trim() },
      include: { family: { select: { id: true, name: true } } },
    })

    if (!invite) return { success: false, error: "Invalid invite code" }
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return { success: false, error: "This invite code has expired" }
    }
    if (invite.useCount >= invite.maxUses) {
      return { success: false, error: "This invite code has reached its maximum uses" }
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { familyId: true },
    })
    if (existingUser?.familyId) {
      return { success: false, error: "You already belong to a family" }
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          familyId: invite.familyId,
          familyRole: familyRole as FamilyRole,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          profileImage: profileImage || undefined,
          onboardingDone: true,
        },
      }),
      prisma.familyInvite.update({
        where: { id: invite.id },
        data: { useCount: { increment: 1 } },
      }),
    ])

    return {
      success: true,
      data: { familyId: invite.familyId, familyName: invite.family.name },
    }
  } catch (err) {
    console.error("[joinFamilyAction]", err)
    return { success: false, error: "Failed to join family. Please try again." }
  }
}

// ─── Get Family ─────────────────────────────────────────────────────────────────

export async function getFamilyWithMembers(familyId: string): Promise<FamilyWithMembers | null> {
  return prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          familyRole: true,
          dateOfBirth: true,
          gender: true,
        },
      },
    },
  })
}

// ─── Get / Create Invite Code ───────────────────────────────────────────────────

export async function getOrCreateInviteCode(
  familyId: string
): Promise<ActionResult<{ code: string }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }

  const existing = await prisma.familyInvite.findFirst({
    where: { familyId, createdById: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  if (existing) return { success: true, data: { code: existing.code } }

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    select: { name: true },
  })
  if (!family) return { success: false, error: "Family not found" }

  const code = generateInviteCode(family.name)
  await prisma.familyInvite.create({
    data: {
      code,
      familyId,
      createdById: session.user.id,
      maxUses: 20,
    },
  })

  return { success: true, data: { code } }
}
