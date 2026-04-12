import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, differenceInDays, addYears, isBefore } from "date-fns"

// ─── Class Merging ──────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date Utilities ─────────────────────────────────────────────────────────────

export function formatDate(date: Date | string, fmt = "MMM d, yyyy"): string {
  return format(new Date(date), fmt)
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

/**
 * Returns the next upcoming birthday date (in the current or next year).
 */
export function getNextBirthday(dateOfBirth: Date): Date {
  const today = new Date()
  const thisYear = today.getFullYear()

  const birthdayThisYear = new Date(
    thisYear,
    new Date(dateOfBirth).getMonth(),
    new Date(dateOfBirth).getDate()
  )

  if (isBefore(birthdayThisYear, today)) {
    return addYears(birthdayThisYear, 1)
  }

  return birthdayThisYear
}

/**
 * Returns days until next birthday (0 = today).
 */
export function daysUntilBirthday(dateOfBirth: Date): number {
  const next = getNextBirthday(new Date(dateOfBirth))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return differenceInDays(next, today)
}

export function getAge(dateOfBirth: Date | string): number {
  const today = new Date()
  const birth = new Date(dateOfBirth)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function isBirthdayToday(dateOfBirth: Date | string): boolean {
  const today = new Date()
  const birth = new Date(dateOfBirth)
  return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate()
}

// ─── String Utilities ───────────────────────────────────────────────────────────

export function initials(firstName: string, lastName?: string | null): string {
  const first = firstName.charAt(0).toUpperCase()
  const last = lastName ? lastName.charAt(0).toUpperCase() : ""
  return first + last
}

export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function familyRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    FATHER: "Father",
    MOTHER: "Mother",
    SON: "Son",
    DAUGHTER: "Daughter",
    BROTHER: "Brother",
    SISTER: "Sister",
    GRANDFATHER: "Grandfather",
    GRANDMOTHER: "Grandmother",
    OTHER: "Family Member",
  }
  return labels[role] ?? capitalise(role)
}

export function familyRoleEmoji(role: string): string {
  const emojis: Record<string, string> = {
    FATHER: "👨",
    MOTHER: "👩",
    SON: "👦",
    DAUGHTER: "👧",
    BROTHER: "👦",
    SISTER: "👧",
    GRANDFATHER: "👴",
    GRANDMOTHER: "👵",
    OTHER: "🧑",
  }
  return emojis[role] ?? "🧑"
}

// ─── Share Utilities ────────────────────────────────────────────────────────────

export function shareToWhatsApp(text: string, url?: string): void {
  const message = url ? `${text} ${url}` : text
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank")
}

export function shareToFacebook(url: string): void {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
}

/**
 * Instagram does not support direct URL sharing from the web.
 * The best approach is: copy text/URL to clipboard → tell user to paste in Instagram story/post.
 */
export async function copyForInstagram(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}

export async function nativeShare(data: ShareData): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share(data)
      return true
    } catch {
      return false
    }
  }
  return false
}

// ─── Misc ───────────────────────────────────────────────────────────────────────

export function generateInviteCode(familyName: string): string {
  const clean = familyName.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${clean}-${random}`
}
