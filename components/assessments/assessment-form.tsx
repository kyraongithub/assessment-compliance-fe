"use client";

import {
  useAssessment,
  useUpdateSubmission,
  useReviewSubmission,
} from "@/hooks/useAssessments";
import { useTemplate } from "@/hooks/useTemplates";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, FileText, Paperclip, Users, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface AssessmentFormProps {
  assessmentId: string;
}

type SubmissionStatus = "PENDING" | "COMPLIANT" | "REJECTED";
type ReviewStatus = "COMPLIANT" | "REJECTED";

interface FormEntry {
  implementationDetail: string;
  evidenceLink: string;
  status: SubmissionStatus;
}

interface ReviewEntry {
  reviewStatus: ReviewStatus | "";
  reviewNote: string;
}

export function AssessmentForm({ assessmentId }: AssessmentFormProps) {
  const { data: assessment, isLoading } = useAssessment(assessmentId);
  const { data: template } = useTemplate(assessment?.templateId || "");
  const { mutate: updateSubmission, isPending: isSaving } =
    useUpdateSubmission();
  const { mutate: reviewSubmission, isPending: isReviewing } =
    useReviewSubmission();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedRequirementId, setSelectedRequirementId] = useState<
    string | null
  >(null);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [formData, setFormData] = useState<Record<string, FormEntry>>({});
  const [reviewData, setReviewData] = useState<Record<string, ReviewEntry>>({});

  const initializedRef = useRef(false);

  // Populate formData once from existing submissions
  useEffect(() => {
    if (!assessment?.submissions || initializedRef.current) return;
    initializedRef.current = true;

    const submissionMap: Record<string, FormEntry> = {};
    for (const sub of assessment.submissions) {
      submissionMap[sub.requirementId] = {
        implementationDetail: sub.implementationDetail ?? "",
        evidenceLink: sub.evidenceLink ?? "",
        status: sub.status ?? "PENDING",
      };
    }
    setFormData(submissionMap);
  }, [assessment?.submissions]);

  // Derived values — computed before early returns so hooks order is stable
  const selectedCategory =
    template?.categories.find((c) => c.id === selectedCategoryId) ??
    template?.categories[0];

  const selectedRequirement =
    selectedCategory?.requirements.find(
      (r) => r.id === selectedRequirementId,
    ) ?? selectedCategory?.requirements[0];

  const currentSubmission = selectedRequirement
    ? assessment?.submissions?.find(
        (s) => s.requirementId === selectedRequirement.id,
      )
    : undefined;

  const currentStatus = selectedRequirement
    ? formData[selectedRequirement.id]?.status
    : undefined;

  const hasSubmission = !!currentSubmission;

  const isPendingSubmission =
    isAdmin && hasSubmission && currentStatus === "PENDING";
  const showReviewButton = isAdmin && (showReviewPanel || isPendingSubmission);

  useEffect(() => {
    if (!showReviewPanel) return;
    if (currentStatus !== undefined && currentStatus !== "PENDING") {
      setShowReviewPanel(false);
    }
  }, [currentStatus, showReviewPanel]);

  // ─── Early returns AFTER all hooks ───────────────────────────────────────────

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

  // ─── Event handlers ───────────────────────────────────────────────────────────

  const currentReview: ReviewEntry = currentSubmission
    ? (reviewData[currentSubmission.id] ?? { reviewStatus: "", reviewNote: "" })
    : { reviewStatus: "", reviewNote: "" };

  const setCurrentReview = (patch: Partial<ReviewEntry>) => {
    if (!currentSubmission) return;
    setReviewData((prev) => ({
      ...prev,
      [currentSubmission.id]: { ...currentReview, ...patch },
    }));
  };

  const handleInputChange = (
    requirementId: string,
    field: "implementationDetail" | "evidenceLink",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [requirementId]: { ...prev[requirementId], [field]: value },
    }));
  };

  const handleSave = () => {
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
        onSuccess: () => toast.success("Submission saved successfully"),
        onError: () => toast.error("Failed to save submission"),
      },
    );
  };

  const handleCompleteReview = () => {
    if (!currentSubmission) {
      toast.error("This requirement has no submission yet");
      return;
    }
    if (!currentReview.reviewStatus) {
      toast.error("Please select a review status");
      return;
    }

    reviewSubmission(
      {
        submissionId: currentSubmission.id,
        status: currentReview.reviewStatus as ReviewStatus,
        reviewNote: currentReview.reviewNote || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Review submitted");
          // Optimistically update dot — this will also trigger the auto-close effect
          setFormData((prev) => ({
            ...prev,
            [currentSubmission.requirementId]: {
              ...prev[currentSubmission.requirementId],
              status: currentReview.reviewStatus as ReviewStatus,
            },
          }));
        },
        onError: () => toast.error("Failed to submit review"),
      },
    );
  };

  const getStatusDotClass = (requirementId: string, isActive: boolean) => {
    const entry = formData[requirementId];
    const hasData = !!entry?.implementationDetail || !!entry?.evidenceLink;
    if (!hasData) return isActive ? "bg-blue-400" : "bg-gray-300";
    switch (entry.status) {
      case "COMPLIANT":
        return "bg-green-400";
      case "REJECTED":
        return "bg-red-400";
      default:
        return "bg-blue-400";
    }
  };

  const canReview = isAdmin && showReviewPanel;

  // ─── Render ───────────────────────────────────────────────────────────────────

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

        {showReviewButton && (
          <Button
            onClick={() => setShowReviewPanel((v) => !v)}
            className={`h-8 px-4 text-xs rounded-lg flex items-center gap-1.5 transition-colors ${
              showReviewPanel
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <Send className="h-3 w-3" />
            {showReviewPanel ? "Close Review" : "Submit for Review"}
          </Button>
        )}
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

      {/* Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel 1: Clauses */}
        <div className="w-48 shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50">
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
        <div className="w-64 shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
          {selectedCategory && (
            <>
              <div className="px-4 pt-4 pb-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {selectedCategory.name}
                </p>
              </div>
              <nav className="py-1">
                {selectedCategory.requirements.map((req) => {
                  const isActive =
                    (selectedRequirementId ??
                      selectedCategory.requirements[0]?.id) === req.id;
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
                        className={`mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full ${getStatusDotClass(req.id, isActive)}`}
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
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  {selectedCategory?.name}
                </p>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {selectedRequirement.title}
                </h2>
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-1">
                    Requirement
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedRequirement.description}
                  </p>
                </div>
              </div>

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

                {/* Save — non-admin only, hide when COMPLIANT */}
                {currentStatus !== "COMPLIANT" &&
                  currentStatus !== "REJECTED" && (
                    <div className="pt-1">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-9 text-sm rounded-lg"
                      >
                        {isSaving ? (
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
                  )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Select a requirement to get started
            </div>
          )}
        </div>

        {/* Panel 4: Admin Review Panel */}
        {canReview && (
          <div className="w-72 shrink-0 border-l border-gray-200 bg-white flex flex-col h-full">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                GRC Review
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Warning jika requirement yang dipilih belum ada submission */}
              {!hasSubmission && (
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                  <p className="text-xs text-amber-700">
                    Choose a requirement to get started
                  </p>
                </div>
              )}

              <div>
                <Label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 block">
                  Reviewer Assessment
                </Label>
                <Select
                  value={currentReview.reviewStatus}
                  onValueChange={(val) =>
                    setCurrentReview({ reviewStatus: val as ReviewStatus })
                  }
                  disabled={!hasSubmission}
                >
                  <SelectTrigger className="w-full h-9 text-sm border-gray-200 rounded-lg">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLIANT">Compliant</SelectItem>
                    <SelectItem value="REJECTED">Not Compliant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="consultant-notes"
                  className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 block"
                >
                  Consultant Notes
                </Label>
                <Textarea
                  id="consultant-notes"
                  placeholder="Enter consultant notes..."
                  value={currentReview.reviewNote}
                  onChange={(e) =>
                    setCurrentReview({ reviewNote: e.target.value })
                  }
                  disabled={!hasSubmission}
                  className="resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-100 rounded-lg text-sm"
                  rows={5}
                />
              </div>
              <div className=" border-t border-gray-100 flex gap-2">
                <Button
                  onClick={handleCompleteReview}
                  disabled={
                    isReviewing || !hasSubmission || !currentReview.reviewStatus
                  }
                  className=" bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm rounded-lg disabled:opacity-50"
                >
                  {isReviewing ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Complete Review"
                  )}
                </Button>
                {/* <Button
                  variant="outline"
                  onClick={() => setShowReviewPanel(false)}
                  className="h-9 text-sm rounded-lg border-gray-200 text-gray-600 hover:text-gray-900"
                >
                  Return to Business
                </Button> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
