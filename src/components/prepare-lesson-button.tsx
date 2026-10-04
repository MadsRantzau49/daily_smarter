import Link from "next/link";
import { Copy } from "lucide-react";

export function PrepareLessonButton() {
  return (
    <Link className="btn" href="/app/today">
      <Copy size={17} /> Build lesson with your LLM
    </Link>
  );
}
