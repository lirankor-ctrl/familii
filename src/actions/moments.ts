"use server"

import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ActionResult, MomentWithAuthor } from "@/types"

const momentSchema = z.object({
  caption: z.string().max(500).optional(),
  imageUrl: z.string().url("Invalid image URL"),
  publicId: z.string().optional(),
  emoji: z.string().max(8).optional(),
})

export async function createMomentAction(
  formData: FormData
): Promise<ActionResult<MomentWithAuthor>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }
  if (!session.user.familyId) return { success: false, error: "You must belong to a family" }

  const parsed = momentSchema.safeParse({
    caption: formData.get("caption") || undefined,
    imageUrl: formData.get("imageUrl"),
    publicId: formData.get("publicId") || undefined,
    emoji: formData.get("emoji") || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const moment = await prisma.moment.create({
      data: {
        ...parsed.data,
        authorId: session.user.id,
        familyId: session.user.familyId,
      },
      include: {
        author: {
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

    return { success: true, data: moment }
  } catch (err) {
    console.error("[createMomentAction]", err)
    return { success: false, error: "Failed to save moment" }
  }
}

export async function getMoments(familyId: string): Promise<MomentWithAuthor[]> {
  return prisma.moment.findMany({
    where: { familyId },
    include: {
      author: {
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
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function deleteMomentAction(momentId: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }

  const moment = await prisma.moment.findUnique({ where: { id: momentId } })
  if (!moment) return { success: false, error: "Moment not found" }
  if (moment.authorId !== session.user.id) {
    return { success: false, error: "You can only delete your own moments" }
  }

  await prisma.moment.delete({ where: { id: momentId } })
  return { success: true, data: undefined }
}
