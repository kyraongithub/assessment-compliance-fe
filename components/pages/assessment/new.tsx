"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCreateAssessment } from "@/hooks/useAssessments";

export default function NewAssessmentPage() {
  const params = useSearchParams();
  const router = useRouter();
  const templateId = params.get("templateId");
  const { mutate } = useCreateAssessment();

  useEffect(() => {
    if (!templateId) return;

    mutate(templateId, {
      onSuccess: (data) => {
        router.replace(`/assessments/${data.id}`);
      },
    });
  }, [templateId]);

  return <div>Creating assessment...</div>;
}
