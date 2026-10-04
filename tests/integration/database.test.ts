import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PrismaClient as PrismaClientType } from "@/generated/prisma/client";

const databaseUrl = process.env.TEST_DATABASE_URL;
const integration = describe.runIf(Boolean(databaseUrl));
let db: PrismaClientType;
let firstUserId: string;
let secondUserId: string;
let configId: string;
let courseId: string;

integration("database authorization and idempotency constraints", () => {
  beforeAll(async () => {
    const { PrismaClient } = await import("@/generated/prisma/client");
    db = new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl! }),
    });
    const suffix = crypto.randomUUID();
    const config = await db.learningConfigVersion.create({
      data: {
        version: Math.floor(Date.now() / 1000),
        domain: "Integration test",
        guidance:
          "A sufficiently detailed integration test curriculum description.",
        emphasizedTopics: [],
        avoidedTopics: [],
        active: false,
      },
    });
    configId = config.id;
    const [first, second] = await Promise.all([
      db.user.create({
        data: {
          email: `first-${suffix}@example.com`,
          name: "First",
          passwordHash: "test",
          settings: { create: { onboardingCompleted: true } },
        },
      }),
      db.user.create({
        data: {
          email: `second-${suffix}@example.com`,
          name: "Second",
          passwordHash: "test",
          settings: { create: { onboardingCompleted: true } },
        },
      }),
    ]);
    firstUserId = first.id;
    secondUserId = second.id;
    const course = await db.course.create({
      data: {
        slug: `integration-${suffix}`,
        title: "Integration course",
        description:
          "A course used to verify ownership and rating constraints.",
        domain: "Testing",
        guidance:
          "Teach reliable integration testing with focused examples and progressive concepts.",
        emphasizedTopics: [],
        avoidedTopics: [],
        creatorId: first.id,
      },
    });
    courseId = course.id;
  });

  afterAll(async () => {
    if (!db) return;
    await db.course.deleteMany({ where: { id: courseId } });
    await db.user.deleteMany({
      where: { id: { in: [firstUserId, secondUserId] } },
    });
    await db.learningConfigVersion.delete({ where: { id: configId } });
    await db.$disconnect();
  });

  it("prevents duplicate daily lessons under concurrent creation", async () => {
    const create = () =>
      db.dailyLesson.create({
        data: { userId: firstUserId, localDate: "2099-01-01" },
      });
    const results = await Promise.allSettled([create(), create()]);
    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      await db.dailyLesson.count({
        where: { userId: firstUserId, localDate: "2099-01-01" },
      }),
    ).toBe(1);
  });

  it("scopes lesson retrieval to its owner", async () => {
    const lesson = await db.dailyLesson.findUniqueOrThrow({
      where: {
        userId_localDate: { userId: firstUserId, localDate: "2099-01-01" },
      },
    });
    expect(
      await db.dailyLesson.findFirst({
        where: { id: lesson.id, userId: secondUserId },
      }),
    ).toBeNull();
  });

  it("keeps existing lessons tied to their original config version", async () => {
    const lesson = await db.dailyLesson.update({
      where: {
        userId_localDate: { userId: firstUserId, localDate: "2099-01-01" },
      },
      data: { learningConfigVersionId: configId },
    });
    const nextConfig = await db.learningConfigVersion.create({
      data: {
        version: Math.floor(Date.now() / 1000) + 1,
        domain: "New domain",
        guidance: "A second sufficiently detailed curriculum description.",
        emphasizedTopics: [],
        avoidedTopics: [],
        active: false,
      },
    });
    expect(
      (await db.dailyLesson.findUniqueOrThrow({ where: { id: lesson.id } }))
        .learningConfigVersionId,
    ).toBe(configId);
    await db.learningConfigVersion.delete({ where: { id: nextConfig.id } });
  });

  it("enforces one bounded rating per user and course", async () => {
    await db.courseRating.create({
      data: { courseId, userId: secondUserId, score: 4 },
    });
    await expect(
      db.courseRating.create({
        data: { courseId, userId: secondUserId, score: 5 },
      }),
    ).rejects.toThrow();
    await expect(
      db.courseRating.create({
        data: { courseId, userId: firstUserId, score: 6 },
      }),
    ).rejects.toThrow();
  });
});
