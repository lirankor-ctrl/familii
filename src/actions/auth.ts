"use server"

import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/types"

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().max(50).optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function signupAction(
  formData: FormData
): Promise<ActionResult<{ userId: string }>> {
  try {
    const raw = {
      firstName: formData.get("firstName") as string,
      lastName: (formData.get("lastName") as string) || undefined,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const parsed = signupSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const { firstName, lastName, email, password } = parsed.data

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })
    if (existing) {
      return { success: false, error: "An account with this email already exists" }
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase().trim(),
        passwordHash,
        onboardingDone: false,
      },
    })

    return { success: true, data: { userId: user.id } }
  } catch (err) {
    console.error("[signupAction]", err)
    return { success: false, error: "Something went wrong. Please try again." }
  }
}
