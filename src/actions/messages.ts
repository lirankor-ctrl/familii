"use server"

import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ActionResult, MessageWithAuthor } from "@/types"

const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(1000),
  emoji: z.string().max(8).optional(),
})

export async function createMessageAction(
  formData: FormData
): Promise<ActionResult<MessageWithAuthor>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }
  if (!session.user.familyId) return { success: false, error: "You must belong to a family" }

  const parsed = messageSchema.safeParse({
    content: formData.get("content"),
    emoji: formData.get("emoji") || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const message = await prisma.familyMessage.create({
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

    return { success: true, data: message as MessageWithAuthor }
  } catch (err) {
    console.error("[createMessageAction]", err)
    return { success: false, error: "Failed to send message" }
  }
}

export async function getMessages(familyId: string): Promise<MessageWithAuthor[]> {
  return prisma.familyMessage.findMany({
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
    take: 100,
  }) as Promise<MessageWithAuthor[]>
}

export async function pinMessageAction(
  messageId: string,
  isPinned: boolean
): Promise<ActionResult> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }

  await prisma.familyMessage.update({
    where: { id: messageId },
    data: { isPinned },
  })

  return { success: true, data: undefined }
}
