"use client";

import { Button } from "@/components/ui/button";
import { AssessmentsList } from "@/components/container/assessments/assessments-list";
import Link from "next/link";
import { ProtectedLayout } from "@/components/layout/protected-layout";

function AssessmentsContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">My Assessments</h1>
            <p className="text-muted-foreground">
              Track and manage your compliance assessments
            </p>
          </div>
          <Link href="/templates">
            <Button>Create New Assessment</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl">
        <AssessmentsList />
      </div>
    </div>
  );
}

export default function AssessmentsPage() {
  return (
    <ProtectedLayout>
      <AssessmentsContent />
    </ProtectedLayout>
  );
}
