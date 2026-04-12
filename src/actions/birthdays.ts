"use server"

import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { daysUntilBirthday, getNextBirthday, getAge, isBirthdayToday } from "@/lib/utils"
import type { ActionResult, BirthdayEntry, BirthdayWishWithAuthor } from "@/types"

export async function getBirthdayEntries(familyId: string): Promise<BirthdayEntry[]> {
  const currentYear = new Date().getFullYear()

  const members = await prisma.user.findMany({
    where: { familyId, dateOfBirth: { not: null } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      familyRole: true,
      dateOfBirth: true,
      gender: true,
    },
  })

  const wishMap = await prisma.birthdayWish.findMany({
    where: { familyId, year: currentYear },
    include: {
      fromUser: {
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

  const entries: BirthdayEntry[] = members
    .filter((m) => m.dateOfBirth)
    .map((member) => {
      const dob = member.dateOfBirth!
      return {
        user: member,
        nextBirthday: getNextBirthday(dob),
        daysUntil: daysUntilBirthday(dob),
        isToday: isBirthdayToday(dob),
        age: getAge(dob),
        wishes: wishMap.filter((w) => w.toUserId === member.id) as BirthdayWishWithAuthor[],
      }
    })

  // Sort: today first, then by days until birthday
  return entries.sort((a, b) => {
    if (a.isToday && !b.isToday) return -1
    if (!a.isToday && b.isToday) return 1
    return a.daysUntil - b.daysUntil
  })
}

const wishSchema = z.object({
  message: z.string().min(1, "Message is required").max(500),
  toUserId: z.string().cuid("Invalid user ID"),
})

export async function sendBirthdayWishAction(
  formData: FormData
): Promise<ActionResult<BirthdayWishWithAuthor>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }
  if (!session.user.familyId) return { success: false, error: "You must belong to a family" }

  const parsed = wishSchema.safeParse({
    message: formData.get("message"),
    toUserId: formData.get("toUserId"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { message, toUserId } = parsed.data
  const year = new Date().getFullYear()

  try {
    const wish = await prisma.birthdayWish.upsert({
      where: {
        fromUserId_toUserId_year: {
          fromUserId: session.user.id,
          toUserId,
          year,
        },
      },
      update: { message },
      create: {
        message,
        toUserId,
        fromUserId: session.user.id,
        familyId: session.user.familyId,
        year,
      },
      include: {
        fromUser: {
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

    return { success: true, data: wish as BirthdayWishWithAuthor }
  } catch (err) {
    console.error("[sendBirthdayWishAction]", err)
    return { success: false, error: "Failed to send wish" }
  }
}
