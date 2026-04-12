import { PrismaClient, FamilyRole, Gender, RSVPStatus } from "@prisma/client"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding Famli database...")

  // Clean up
  await prisma.familyMessage.deleteMany()
  await prisma.experiencePost.deleteMany()
  await prisma.mealRSVP.deleteMany()
  await prisma.mealEvent.deleteMany()
  await prisma.birthdayWish.deleteMany()
  await prisma.moment.deleteMany()
  await prisma.familyInvite.deleteMany()
  await prisma.user.deleteMany()
  await prisma.family.deleteMany()

  const passwordHash = await bcrypt.hash("famli123", 12)

  // Create family
  const family = await prisma.family.create({
    data: {
      name: "The Johnson Family",
      description: "Our little corner of the world 💛",
      emoji: "🏡",
    },
  })

  // Create members
  const dad = await prisma.user.create({
    data: {
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael@famli.app",
      passwordHash,
      dateOfBirth: new Date("1975-06-15"),
      familyRole: FamilyRole.FATHER,
      gender: Gender.MALE,
      familyId: family.id,
      onboardingDone: true,
      profileImage: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    },
  })

  const mom = await prisma.user.create({
    data: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@famli.app",
      passwordHash,
      dateOfBirth: new Date("1978-03-22"),
      familyRole: FamilyRole.MOTHER,
      gender: Gender.FEMALE,
      familyId: family.id,
      onboardingDone: true,
    },
  })

  const son = await prisma.user.create({
    data: {
      firstName: "Ethan",
      lastName: "Johnson",
      email: "ethan@famli.app",
      passwordHash,
      dateOfBirth: new Date("2003-11-08"),
      familyRole: FamilyRole.SON,
      gender: Gender.MALE,
      familyId: family.id,
      onboardingDone: true,
    },
  })

  const daughter = await prisma.user.create({
    data: {
      firstName: "Emma",
      lastName: "Johnson",
      email: "emma@famli.app",
      passwordHash,
      dateOfBirth: new Date("2007-04-30"),
      familyRole: FamilyRole.DAUGHTER,
      gender: Gender.FEMALE,
      familyId: family.id,
      onboardingDone: true,
    },
  })

  // Create invite code
  await prisma.familyInvite.create({
    data: {
      code: "JOHNSON-" + randomBytes(4).toString("hex").toUpperCase(),
      familyId: family.id,
      createdById: dad.id,
      maxUses: 10,
    },
  })

  // Create moments
  await prisma.moment.createMany({
    data: [
      {
        caption: "Sunday afternoon at the park ☀️",
        imageUrl: "https://images.unsplash.com/photo-1601935111741-ae98b2b230b0?w=800",
        authorId: mom.id,
        familyId: family.id,
      },
      {
        caption: "Ethan's first day at university! So proud 🎓",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
        authorId: dad.id,
        familyId: family.id,
      },
      {
        caption: "Emma made dinner for the whole family tonight 🍝",
        imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
        authorId: mom.id,
        familyId: family.id,
      },
      {
        caption: "Saturday morning hike! 🥾",
        imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
        authorId: son.id,
        familyId: family.id,
      },
    ],
  })

  // Create birthday wishes
  const currentYear = new Date().getFullYear()
  await prisma.birthdayWish.createMany({
    data: [
      {
        message: "Happy birthday Dad! You're the best! 🎂❤️",
        year: currentYear,
        fromUserId: daughter.id,
        toUserId: dad.id,
        familyId: family.id,
      },
      {
        message: "Wishing you the happiest birthday ever, Dad! Love you tons 🎉",
        year: currentYear,
        fromUserId: son.id,
        toUserId: dad.id,
        familyId: family.id,
      },
    ],
  })

  // Create meals
  const meal1 = await prisma.mealEvent.create({
    data: {
      title: "Sunday Family Dinner",
      notes: "Grandma's lasagna recipe! Everyone bring something.",
      location: "Home",
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // next week
      createdById: mom.id,
      familyId: family.id,
    },
  })

  const meal2 = await prisma.mealEvent.create({
    data: {
      title: "Emma's Birthday Lunch",
      notes: "Her favourite — sushi! 🍣",
      location: "Sakura Restaurant",
      scheduledAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      createdById: mom.id,
      familyId: family.id,
    },
  })

  await prisma.mealRSVP.createMany({
    data: [
      { userId: dad.id, mealEventId: meal1.id, status: RSVPStatus.GOING },
      { userId: mom.id, mealEventId: meal1.id, status: RSVPStatus.GOING },
      { userId: son.id, mealEventId: meal1.id, status: RSVPStatus.MAYBE, note: "Might be late" },
      { userId: daughter.id, mealEventId: meal1.id, status: RSVPStatus.GOING },
      { userId: dad.id, mealEventId: meal2.id, status: RSVPStatus.GOING },
      { userId: mom.id, mealEventId: meal2.id, status: RSVPStatus.GOING },
      { userId: son.id, mealEventId: meal2.id, status: RSVPStatus.GOING },
    ],
  })

  // Create experiences
  await prisma.experiencePost.createMany({
    data: [
      {
        title: "Ethan's First Solo Road Trip",
        content:
          "I drove 400km by myself for the first time last weekend. Scary at first but absolutely incredible. Stopped at that lookout near the mountains — it made me realise how big the world is and how grateful I am for our family back home.",
        authorId: son.id,
        familyId: family.id,
      },
      {
        title: "Reflecting on 25 Years of Marriage",
        content:
          "Today Michael and I celebrate 25 years together. I look around at our family and I am just overwhelmed with gratitude. The kids, the chaos, the laughter at dinner — this is everything. Here's to 25 more. ❤️",
        authorId: mom.id,
        familyId: family.id,
      },
      {
        title: "I baked sourdough for the first time!",
        content:
          "Okay so it took me three failed attempts but I FINALLY baked a proper sourdough loaf. Mum said it was better than the bakery and honestly that might be the best compliment I've ever received 😂 Recipe coming next week.",
        authorId: daughter.id,
        familyId: family.id,
      },
    ],
  })

  // Create messages
  await prisma.familyMessage.createMany({
    data: [
      {
        content: "Good morning, family! Who's up for a walk after dinner tonight? 🌳",
        authorId: dad.id,
        familyId: family.id,
        emoji: "🌳",
      },
      {
        content: "Reminder: Grandma and Grandpa are visiting next Saturday! Let's plan something special 🥰",
        authorId: mom.id,
        familyId: family.id,
        isPinned: true,
        emoji: "🥰",
      },
      {
        content: "I got an A on my history paper!! 🎉🎉",
        authorId: daughter.id,
        familyId: family.id,
        emoji: "🎉",
      },
      {
        content: "Proud of you, Emma!! That's our girl 💪",
        authorId: dad.id,
        familyId: family.id,
      },
      {
        content: "Anyone want anything from the shops? I'm heading out now.",
        authorId: son.id,
        familyId: family.id,
      },
    ],
  })

  console.log("✅ Seed complete!")
  console.log("")
  console.log("Test accounts:")
  console.log("  michael@famli.app / famli123  (Father)")
  console.log("  sarah@famli.app   / famli123  (Mother)")
  console.log("  ethan@famli.app   / famli123  (Son)")
  console.log("  emma@famli.app    / famli123  (Daughter)")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
