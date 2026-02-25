"use client";

import { useAssessment, useUpdateSubmission } from "@/hooks/useAssessments";
import { useTemplate } from "@/hooks/useTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  ChevronRight,
  FileText,
  Paperclip,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AssessmentFormProps {
  assessmentId: string;
}

export function AssessmentForm({ assessmentId }: AssessmentFormProps) {
  const { data: assessment, isLoading } = useAssessment(assessmentId);
  const { data: template } = useTemplate(assessment?.templateId || "");
  const { mutate: updateSubmission, isPending } = useUpdateSubmission();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedRequirementId, setSelectedRequirementId] = useState<
    string | null
  >(null);
  const [formData, setFormData] = useState<
    Record<
      string,
      {
        implementationDetail: string;
        evidenceLink: string;
      }
    >
  >({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!assessment || !template) {
    return <div className="text-gray-400 p-8">Assessment not found</div>;
  }

  const selectedCategory =
    template.categories.find((c) => c.id === selectedCategoryId) ??
    template.categories[0];

  const selectedRequirement =
    selectedCategory?.requirements.find(
      (r) => r.id === selectedRequirementId,
    ) ?? selectedCategory?.requirements[0];

  const handleInputChange = (
    requirementId: string,
    field: "implementationDetail" | "evidenceLink",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [requirementId]: {
        ...prev[requirementId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    if (!selectedRequirement) return;
    const requirementId = selectedRequirement.id;
    const data = formData[requirementId];
    if (!data?.implementationDetail && !data?.evidenceLink) {
      toast.error("Please fill in at least one field");
      return;
    }

    updateSubmission(
      {
        assessmentId,
        requirementId,
        implementationDetail: data.implementationDetail,
        evidenceLink: data.evidenceLink,
      },
      {
        onSuccess: () => {
          toast.success("Submission saved successfully");
          setFormData((prev) => {
            const newData = { ...prev };
            delete newData[requirementId];
            return newData;
          });
        },
        onError: () => {
          toast.error("Failed to save submission");
        },
      },
    );
  };

  const activeCategory = selectedCategoryId ?? template.categories[0]?.id;
  const activeRequirement =
    selectedRequirementId ?? selectedCategory?.requirements[0]?.id;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-800">
            {template.title}
          </span>
          <Badge
            variant="outline"
            className="text-xs font-medium border-blue-200 text-blue-700 bg-blue-50"
          >
            {assessment.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200 px-6 flex items-center gap-6 bg-white">
        <button className="py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600 -mb-px flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Controls
        </button>
        <button className="py-3 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1.5">
          <Paperclip className="h-3.5 w-3.5" />
          Attachments
        </button>
        <button className="py-3 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          Control Owners
        </button>
      </div>

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel 1: Clauses */}
        <div className="w-48 flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Clauses
            </p>
          </div>
          <nav className="py-1">
            {template.categories.map((category, idx) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategoryId(category.id);
                  setSelectedRequirementId(null);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  (selectedCategoryId ?? template.categories[0]?.id) ===
                  category.id
                    ? "bg-white text-blue-700 font-semibold border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                }`}
              >
                {idx + 1}. {category.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Panel 2: Requirements list */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
          {selectedCategory && (
            <>
              <div className="px-4 pt-4 pb-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {selectedCategory.name}
                </p>
              </div>
              <nav className="py-1">
                {selectedCategory.requirements.map((req, idx) => {
                  const isActive =
                    (selectedRequirementId ??
                      selectedCategory.requirements[0]?.id) === req.id;
                  const hasData =
                    !!formData[req.id]?.implementationDetail ||
                    !!formData[req.id]?.evidenceLink;
                  return (
                    <button
                      key={req.id}
                      onClick={() => setSelectedRequirementId(req.id)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-start gap-2 ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${
                          hasData
                            ? "bg-green-400"
                            : isActive
                              ? "bg-blue-400"
                              : "bg-gray-300"
                        }`}
                      />
                      <span className="leading-snug">{req.title}</span>
                    </button>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        {/* Panel 3: Form detail */}
        <div className="flex-1 overflow-y-auto">
          {selectedRequirement ? (
            <div className="max-w-2xl px-8 py-6">
              {/* Requirement header */}
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  {selectedCategory?.name}
                </p>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {selectedRequirement.title}
                </h2>

                {/* Requirement description box */}
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-1">
                    Requirement
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedRequirement.description}
                  </p>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-5">
                <div>
                  <Label
                    htmlFor={`detail-${selectedRequirement.id}`}
                    className="text-xs font-semibold uppercase tracking-widest text-gray-400"
                  >
                    Implementation Details
                  </Label>
                  <Textarea
                    id={`detail-${selectedRequirement.id}`}
                    placeholder="Describe how you implement this requirement..."
                    value={
                      formData[selectedRequirement.id]?.implementationDetail ||
                      ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        selectedRequirement.id,
                        "implementationDetail",
                        e.target.value,
                      )
                    }
                    className="mt-2 resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-100 rounded-lg"
                    rows={5}
                  />
                </div>

                <div>
                  <Label
                    htmlFor={`link-${selectedRequirement.id}`}
                    className="text-xs font-semibold uppercase tracking-widest text-gray-400"
                  >
                    Evidence Link
                  </Label>
                  <Input
                    id={`link-${selectedRequirement.id}`}
                    type="url"
                    placeholder="https://..."
                    value={formData[selectedRequirement.id]?.evidenceLink || ""}
                    onChange={(e) =>
                      handleInputChange(
                        selectedRequirement.id,
                        "evidenceLink",
                        e.target.value,
                      )
                    }
                    className="mt-2 border-gray-200 focus:border-blue-400 focus:ring-blue-100 rounded-lg"
                  />
                </div>

                <div className="pt-1 flex gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-9 text-sm rounded-lg"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-3.5 w-3.5" />
                        Save Response
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Select a requirement to get started
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
