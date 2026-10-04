import "dotenv/config";
import { defineConfig } from "prisma/config";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5432/daily_smarter?schema=public";

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
});
