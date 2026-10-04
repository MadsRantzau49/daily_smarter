import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes("@"))
  throw new Error("Usage: npm run admin:promote -- user@example.com");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  const user = await db.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });
  console.log(`Promoted ${user.email} to ADMIN`);
} finally {
  await db.$disconnect();
}
