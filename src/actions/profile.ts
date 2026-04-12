"use server"

import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/types"
import type { FamilyRole } from "@prisma/client"

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().max(50).optional(),
  dateOfBirth: z.string().optional(),
  profileImage: z.string().url().optional().or(z.literal("")),
  familyRole: z.string().optional(),
})

export async function updateProfileAction(
  formData: FormData
): Promise<ActionResult<{ profileImage: string | null }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }

  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName") || undefined,
    dateOfBirth: formData.get("dateOfBirth") || undefined,
    profileImage: formData.get("profileImage") || undefined,
    familyRole: formData.get("familyRole") || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { firstName, lastName, dateOfBirth, profileImage, familyRole } = parsed.data

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName: lastName ?? null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        profileImage: profileImage || null,
        familyRole: familyRole ? (familyRole as FamilyRole) : undefined,
      },
    })

    return { success: true, data: { profileImage: updated.profileImage } }
  } catch (err) {
    console.error("[updateProfileAction]", err)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      familyRole: true,
      dateOfBirth: true,
      gender: true,
      familyId: true,
      onboardingDone: true,
      family: {
        select: { id: true, name: true, emoji: true },
      },
    },
  })
}
