import { createCourseAction } from "@/actions/courses";
import { CourseForm } from "@/components/course-form";

export const metadata = { title: "Create course" };

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <p className="eyebrow">New curriculum</p>
        <h1 className="display mt-3 text-5xl">Create a course</h1>
        <p className="muted mt-4 max-w-2xl leading-7">
          Define the domain and teaching direction. The app keeps the lesson
          structure and safety rules fixed.
        </p>
      </header>
      <section className="card mt-10 p-6 sm:p-8">
        <CourseForm action={createCourseAction} />
      </section>
    </div>
  );
}
