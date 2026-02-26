"use client";

import { Button } from "@/components/ui/button";
import { AssessmentForm } from "@/components/container/assessments/assessment-form";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AssessmentDetailPage() {
  const { id } = useParams() as { id: string };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-foreground">
                RegXperience
              </h1>
            </Link>
            <nav className="flex gap-4">
              <Link href="/templates">
                <Button variant="ghost">Templates</Button>
              </Link>
              <Link href="/assessments">
                <Button variant="ghost">My Assessments</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/assessments"
          className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Assessments
        </Link>

        <AssessmentForm assessmentId={id} />
      </main>
    </div>
  );
}
