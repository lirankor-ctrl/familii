import type {
  User,
  Family,
  Moment,
  BirthdayWish,
  MealEvent,
  MealRSVP,
  ExperiencePost,
  FamilyMessage,
  FamilyInvite,
  FamilyRole,
  RSVPStatus,
} from "@prisma/client"

// ─── Re-exports ─────────────────────────────────────────────────────────────────

export type { FamilyRole, RSVPStatus }

// ─── Enriched Types ─────────────────────────────────────────────────────────────

export type PublicUser = Pick<
  User,
  "id" | "firstName" | "lastName" | "profileImage" | "familyRole" | "dateOfBirth" | "gender"
>

export type FamilyWithMembers = Family & {
  members: PublicUser[]
}

export type MomentWithAuthor = Moment & {
  author: PublicUser
}

export type BirthdayWishWithAuthor = BirthdayWish & {
  fromUser: PublicUser
}

export type MealWithRSVPs = MealEvent & {
  createdBy: PublicUser
  rsvps: (MealRSVP & { user: PublicUser })[]
}

export type ExperienceWithAuthor = ExperiencePost & {
  author: PublicUser
}

export type MessageWithAuthor = FamilyMessage & {
  author: PublicUser
}

export type InviteWithFamily = FamilyInvite & {
  family: Pick<Family, "id" | "name" | "emoji">
}

// ─── Birthday Derived Type ──────────────────────────────────────────────────────

export interface BirthdayEntry {
  user: PublicUser
  nextBirthday: Date
  daysUntil: number
  isToday: boolean
  age: number
  wishes: BirthdayWishWithAuthor[]
}

// ─── Server Action Results ──────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── Form State ─────────────────────────────────────────────────────────────────

export interface SignupFormData {
  firstName: string
  lastName?: string
  email: string
  password: string
}

export interface OnboardingFormData {
  familyId?: string
  inviteCode?: string
  familyName?: string
  familyRole: FamilyRole
  dateOfBirth: string
  profileImage?: string
}

export interface MealFormData {
  title: string
  notes?: string
  location?: string
  scheduledAt: string
  imageUrl?: string
}
