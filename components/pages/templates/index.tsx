"use client";

import { TemplatesList } from "@/components/container/templates/templates-list";
import { UploadTemplate } from "@/components/container/templates/upload-template";
import { ProtectedLayout } from "@/components/layout/protected-layout";

function TemplatesContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Compliance Templates</h1>
        <p className="text-muted-foreground">
          Upload compliance documents or start an assessment from existing
          templates
        </p>
      </div>

      <div className="mb-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <UploadTemplate />
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Available Templates</h2>
          <TemplatesList />
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <ProtectedLayout>
      <TemplatesContent />
    </ProtectedLayout>
  );
}
