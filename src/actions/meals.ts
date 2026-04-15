"use server"

import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ActionResult, MealWithRSVPs } from "@/types"
import type { RSVPStatus } from "@prisma/client"

const mealSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  notes: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  scheduledAt: z.string().min(1, "Date is required"),
  imageUrl: z.string().optional(),
})

export async function createMealAction(
  formData: FormData
): Promise<ActionResult<MealWithRSVPs>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }
  if (!session.user.familyId) return { success: false, error: "You must belong to a family" }

  const parsed = mealSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes") || undefined,
    location: formData.get("location") || undefined,
    scheduledAt: formData.get("scheduledAt"),
    imageUrl: formData.get("imageUrl") || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const meal = await prisma.mealEvent.create({
      data: {
        ...parsed.data,
        scheduledAt: new Date(parsed.data.scheduledAt),
        imageUrl: parsed.data.imageUrl || null,
        createdById: session.user.id,
        familyId: session.user.familyId,
      },
      include: {
        createdBy: {
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
        rsvps: {
          include: {
            user: {
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
        },
      },
    })

    return { success: true, data: meal as MealWithRSVPs }
  } catch (err) {
    console.error("[createMealAction]", err)
    return { success: false, error: "Failed to create meal event" }
  }
}

export async function rsvpMealAction(
  mealEventId: string,
  status: RSVPStatus,
  note?: string
): Promise<ActionResult> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }

  try {
    await prisma.mealRSVP.upsert({
      where: {
        userId_mealEventId: {
          userId: session.user.id,
          mealEventId,
        },
      },
      update: { status, note },
      create: {
        userId: session.user.id,
        mealEventId,
        status,
        note,
      },
    })

    return { success: true, data: undefined }
  } catch (err) {
    console.error("[rsvpMealAction]", err)
    return { success: false, error: "Failed to update RSVP" }
  }
}

export async function updateMealAction(
  mealId: string,
  formData: FormData
): Promise<ActionResult<MealWithRSVPs>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }

  const existing = await prisma.mealEvent.findUnique({
    where: { id: mealId },
    select: { createdById: true },
  })

  if (!existing) return { success: false, error: "Meal not found" }
  if (existing.createdById !== session.user.id) return { success: false, error: "Not authorized" }

  const parsed = mealSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes") || undefined,
    location: formData.get("location") || undefined,
    scheduledAt: formData.get("scheduledAt"),
    imageUrl: formData.get("imageUrl") || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const meal = await prisma.mealEvent.update({
      where: { id: mealId },
      data: {
        ...parsed.data,
        scheduledAt: new Date(parsed.data.scheduledAt),
        imageUrl: parsed.data.imageUrl || null,
      },
      include: {
        createdBy: {
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
        rsvps: {
          include: {
            user: {
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
        },
      },
    })

    return { success: true, data: meal as MealWithRSVPs }
  } catch (err) {
    console.error("[updateMealAction]", err)
    return { success: false, error: "Failed to update meal event" }
  }
}

export async function getMeals(familyId: string): Promise<MealWithRSVPs[]> {
  return prisma.mealEvent.findMany({
    where: { familyId },
    include: {
      createdBy: {
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
      rsvps: {
        include: {
          user: {
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
      },
    },
    orderBy: { scheduledAt: "asc" },
  }) as Promise<MealWithRSVPs[]>
}
