import { notFound } from "next/navigation";
import { updateCourseAction } from "@/actions/courses";
import { CourseForm } from "@/components/course-form";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Edit course" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await requireUser();
  const { courseId } = await params;
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course || (course.creatorId !== user.id && user.role !== "ADMIN"))
    notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <p className="eyebrow">Course controls</p>
        <h1 className="display mt-3 text-5xl">Edit {course.title}</h1>
        <p className="muted mt-4">
          Changes affect future prompts only. Existing lessons remain unchanged.
        </p>
      </header>
      <section className="card mt-10 p-6 sm:p-8">
        <CourseForm
          action={updateCourseAction.bind(null, course.id)}
          course={course}
        />
      </section>
    </div>
  );
}
