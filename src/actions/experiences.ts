"use server"

import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ActionResult, ExperienceWithAuthor } from "@/types"

const experienceSchema = z.object({
  title: z.string().max(120).optional(),
  content: z.string().min(1, "Content is required").max(3000),
  imageUrl: z.string().url().optional().or(z.literal("")),
  publicId: z.string().optional(),
})

export async function createExperienceAction(
  formData: FormData
): Promise<ActionResult<ExperienceWithAuthor>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }
  if (!session.user.familyId) return { success: false, error: "You must belong to a family" }

  const parsed = experienceSchema.safeParse({
    title: formData.get("title") || undefined,
    content: formData.get("content"),
    imageUrl: formData.get("imageUrl") || undefined,
    publicId: formData.get("publicId") || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const experience = await prisma.experiencePost.create({
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

    return { success: true, data: experience as ExperienceWithAuthor }
  } catch (err) {
    console.error("[createExperienceAction]", err)
    return { success: false, error: "Failed to save experience" }
  }
}

export async function getExperiences(familyId: string): Promise<ExperienceWithAuthor[]> {
  return prisma.experiencePost.findMany({
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
  }) as Promise<ExperienceWithAuthor[]>
}
