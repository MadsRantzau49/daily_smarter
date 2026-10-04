CREATE TABLE "Course" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "guidance" TEXT NOT NULL,
  "emphasizedTopics" JSONB NOT NULL,
  "avoidedTopics" JSONB NOT NULL,
  "defaultDifficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
  "explanationLength" "ExplanationLength" NOT NULL DEFAULT 'NORMAL',
  "teachingStyle" "TeachingStyle" NOT NULL DEFAULT 'BEGINNER_FRIENDLY',
  "additionalGuidance" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "creatorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseRating" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CourseRating_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CourseRating_score_check" CHECK ("score" BETWEEN 1 AND 5)
);

CREATE TABLE "ReminderDelivery" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "localDate" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReminderDelivery_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "UserSettings" ADD COLUMN "selectedCourseId" TEXT;
ALTER TABLE "DailyLesson" ADD COLUMN "courseId" TEXT;

CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
CREATE INDEX "Course_isPublic_createdAt_idx" ON "Course"("isPublic", "createdAt");
CREATE INDEX "Course_creatorId_idx" ON "Course"("creatorId");
CREATE UNIQUE INDEX "CourseRating_courseId_userId_key" ON "CourseRating"("courseId", "userId");
CREATE INDEX "CourseRating_courseId_score_idx" ON "CourseRating"("courseId", "score");
CREATE INDEX "CourseRating_userId_idx" ON "CourseRating"("userId");
CREATE UNIQUE INDEX "ReminderDelivery_userId_localDate_key" ON "ReminderDelivery"("userId", "localDate");
CREATE INDEX "ReminderDelivery_sentAt_idx" ON "ReminderDelivery"("sentAt");
CREATE INDEX "UserSettings_selectedCourseId_idx" ON "UserSettings"("selectedCourseId");
CREATE INDEX "DailyLesson_courseId_idx" ON "DailyLesson"("courseId");

INSERT INTO "Course" (
  "id", "slug", "title", "description", "domain", "guidance",
  "emphasizedTopics", "avoidedTopics", "defaultDifficulty",
  "explanationLength", "teachingStyle", "additionalGuidance",
  "isPublic", "isSystem", "createdAt", "updatedAt"
)
SELECT
  'system-low-level-computing', 'low-level-computing',
  'Low-level computing',
  'Build a connected understanding of computers from electricity and digital logic through processors, memory, buses, firmware, and hardware interfaces.',
  "domain", "guidance", "emphasizedTopics", "avoidedTopics",
  "defaultDifficulty", "explanationLength", "teachingStyle",
  "additionalGuidance", true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "LearningConfigVersion"
WHERE "active" = true
ORDER BY "version" DESC
LIMIT 1
ON CONFLICT ("slug") DO NOTHING;

ALTER TABLE "Course" ADD CONSTRAINT "Course_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CourseRating" ADD CONSTRAINT "CourseRating_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseRating" ADD CONSTRAINT "CourseRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReminderDelivery" ADD CONSTRAINT "ReminderDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_selectedCourseId_fkey" FOREIGN KEY ("selectedCourseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DailyLesson" ADD CONSTRAINT "DailyLesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
