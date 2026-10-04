import "dotenv/config";
import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  DEFAULT_DOMAIN,
  DEFAULT_EMPHASIZED_TOPICS,
  DEFAULT_GUIDANCE,
} from "../src/lib/constants";

if (process.env.NODE_ENV === "production")
  throw new Error("The development seed cannot run in production");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const topics = [
  ["electric_current", "How Electric Current Carries Energy"],
  ["digital_signals", "Why Computers Use Digital Signals"],
  ["transistors", "The Transistor as an Electronic Switch"],
  ["logic_gates", "How Logic Gates Make Decisions"],
  ["clock_signals", "The Clock That Coordinates a Processor"],
  ["cpu_architecture", "The Main Parts of a CPU"],
  ["cpu_registers", "Registers: The CPU's Fastest Storage"],
  ["machine_instructions", "How a CPU Follows an Instruction"],
  ["ram", "Why Working Data Lives in RAM"],
  ["cpu_cache", "Why CPUs Need a Cache"],
  ["cache_lines", "How Cache Lines Move Blocks of Data"],
  ["memory_bus", "The Shared Roads Inside a Computer"],
  ["hardware_interrupts", "How Devices Get the CPU's Attention"],
  ["direct_memory_access", "How DMA Moves Data Without Keeping the CPU Busy"],
] as const;

function isoDaysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

async function main() {
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? "DevelopmentOnly!123";
  const demoPassword = process.env.SEED_DEMO_PASSWORD ?? "DevelopmentOnly!123";
  const [admin, demo] = await Promise.all([
    db.user.upsert({
      where: { email: process.env.SEED_ADMIN_EMAIL ?? "admin@example.com" },
      create: {
        email: process.env.SEED_ADMIN_EMAIL ?? "admin@example.com",
        name: "Admin",
        role: "ADMIN",
        passwordHash: await argon2.hash(adminPassword),
        settings: {
          create: { onboardingCompleted: true, timezone: "Europe/Copenhagen" },
        },
      },
      update: {},
    }),
    db.user.upsert({
      where: { email: process.env.SEED_DEMO_EMAIL ?? "demo@example.com" },
      create: {
        email: process.env.SEED_DEMO_EMAIL ?? "demo@example.com",
        name: "Alex Morgan",
        passwordHash: await argon2.hash(demoPassword),
        settings: {
          create: { onboardingCompleted: true, timezone: "Europe/Copenhagen" },
        },
      },
      update: {},
    }),
  ]);
  let config = await db.learningConfigVersion.findFirst({
    where: { active: true },
  });
  config ??= await db.learningConfigVersion.create({
    data: {
      version: 1,
      domain: DEFAULT_DOMAIN,
      guidance: DEFAULT_GUIDANCE,
      emphasizedTopics: DEFAULT_EMPHASIZED_TOPICS,
      avoidedTopics: [],
      defaultDifficulty: "BEGINNER",
      explanationLength: "NORMAL",
      teachingStyle: "BEGINNER_FRIENDLY",
      active: true,
      createdById: admin.id,
    },
  });

  const course = await db.course.upsert({
    where: { slug: "low-level-computing" },
    create: {
      slug: "low-level-computing",
      title: "Low-level computing",
      description:
        "Build a connected understanding of computers from electricity and digital logic through processors, memory, buses, firmware, and hardware interfaces.",
      domain: DEFAULT_DOMAIN,
      guidance: DEFAULT_GUIDANCE,
      emphasizedTopics: DEFAULT_EMPHASIZED_TOPICS,
      avoidedTopics: [],
      defaultDifficulty: "BEGINNER",
      explanationLength: "NORMAL",
      teachingStyle: "BEGINNER_FRIENDLY",
      isPublic: true,
      isSystem: true,
    },
    update: {},
  });
  await db.userSettings.updateMany({
    where: { userId: { in: [admin.id, demo.id] }, selectedCourseId: null },
    data: { selectedCourseId: course.id },
  });

  for (const [index, [topicKey, title]] of topics.entries()) {
    const localDate = isoDaysAgo(topics.length - index);
    const correct = index % 5 !== 0;
    await db.dailyLesson.upsert({
      where: { userId_localDate: { userId: demo.id, localDate } },
      create: {
        userId: demo.id,
        localDate,
        status: "READY",
        title,
        topicKey,
        difficulty: "BEGINNER",
        estimatedReadingMinutes: 6,
        introduction: `Today you'll build a practical mental model for ${title.toLowerCase()}.`,
        concept: `${title} is one part of the chain that turns electrical behavior into useful computation. The important idea is not to memorize isolated facts, but to understand what this component receives, what it changes, and what it passes onward.`,
        howItWorks: `Signals arrive at the component, are interpreted according to a small set of physical or logical rules, and produce an output. Timing and shared connections let many such operations cooperate without every component needing to know the whole system.`,
        whyItMatters: `This mechanism helps explain both computer performance and behavior. It also gives you a foundation for understanding the next layer of the machine rather than treating hardware as a black box.`,
        concreteExample: `Imagine a carefully coordinated workshop. Each station performs one constrained job and passes its result to the next station. The useful outcome comes from both the individual operation and the protocol used to hand work onward.`,
        keyTerms: [
          {
            term: "Signal",
            definition:
              "A physical quantity used to represent and communicate information.",
          },
          {
            term: "State",
            definition:
              "The information a component holds at a particular moment.",
          },
          {
            term: "Timing",
            definition:
              "The coordination of when operations and transfers happen.",
          },
        ],
        quizQuestion: `What is the most useful way to understand ${topicKey.replaceAll("_", " ")}?`,
        quizOptions: [
          "As an isolated fact",
          "By its inputs, operation, and outputs",
          "As a software file",
          "By its color",
        ],
        quizCorrectIndex: 1,
        quizExplanation:
          "Following inputs, transformations, and outputs creates a reusable mental model and shows how one component connects to the larger machine.",
        prerequisiteTopics: index ? [topics[index - 1][0]] : [],
        relatedTopics:
          index < topics.length - 1
            ? [topics[index + 1][0]]
            : ["device_controllers"],
        learningConfigVersionId: config.id,
        courseId: course.id,
        aiModel: "seed-fixture",
        openedAt: new Date(`${localDate}T08:00:00Z`),
        generatedAt: new Date(`${localDate}T07:55:00Z`),
        completion: {
          create: {
            userId: demo.id,
            localDate,
            quizCorrect: correct,
            completedAt: new Date(`${localDate}T08:07:00Z`),
          },
        },
        quizAttempts: {
          create: {
            userId: demo.id,
            selectedIndex: correct ? 1 : 0,
            correct,
            createdAt: new Date(`${localDate}T08:07:00Z`),
          },
        },
      },
      update: { courseId: course.id },
    });
    await db.userTopicProgress.upsert({
      where: { userId_topicKey: { userId: demo.id, topicKey } },
      create: {
        userId: demo.id,
        topicKey,
        timesCompleted: 1,
        correctAnswers: correct ? 1 : 0,
        lastStudiedAt: new Date(`${localDate}T08:07:00Z`),
      },
      update: {},
    });
  }
  console.log(`Seeded admin ${admin.email} and demo user ${demo.email}`);
}

main().finally(() => db.$disconnect());
