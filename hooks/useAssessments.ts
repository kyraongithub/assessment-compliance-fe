import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { useTemplate } from "./useTemplates";
import { useAuth } from "./useAuth";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface Submission {
  id: string;
  requirementId: string;
  implementationDetail?: string;
  evidenceLink?: string;
  status: "PENDING" | "COMPLIANT" | "REJECTED";
}

export interface Assessment {
  id: string;
  userId: string;
  templateId: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "REVIEWED";
  submissions?: Submission[];
  createdAt?: string;
  updatedAt?: string;
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
/**
 * Fetch all assessments for the current user
 */
export function useAssessments() {
  return useQuery<Assessment[]>({
    queryKey: ["assessments"],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch("/api/assessments", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch assessments");
      return response.json();
    },
  });
}

/**
 * Fetch a single assessment by ID
 */
export function useAssessment(assessmentId: string) {
  return useQuery<Assessment>({
    queryKey: ["assessment", assessmentId],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch assessment");
      return response.json();
    },
    enabled: !!assessmentId,
  });
}

/**
 * Create a new assessment from a template
 */
export function useCreateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const token = getAuthToken();
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ templateId }),
      });

      if (!response.ok) throw new Error("Failed to create assessment");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate assessments list to refetch
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

/**
 * Update or create a submission
 */
export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      assessmentId: string;
      requirementId: string;
      implementationDetail?: string;
      evidenceLink?: string;
    }) => {
      const token = getAuthToken();
      const response = await fetch("/api/submissions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update submission");
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate the assessment to refetch submissions
      queryClient.invalidateQueries({
        queryKey: ["assessment", variables.assessmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

/**
 * Review a submission (admin only)
 */
export function useReviewSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      submissionId: string;
      status: "COMPLIANT" | "REJECTED";
      reviewNote?: string;
    }) => {
      const token = getAuthToken();
      const response = await fetch(
        `/api/submissions/${data.submissionId}/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            status: data.status,
            ...(data.reviewNote && { reviewNote: data.reviewNote }),
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to review submission");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

export function useSubmissionForm(assessmentId: string) {
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

  return {
    formData,
    reviewData,
    selectedCategory,
    selectedRequirement,
    currentSubmission,
    currentReview,
    currentStatus,
    hasSubmission,
    isPendingSubmission,
    showReviewButton,
    canReview,
    handleInputChange,
    handleSave,
    handleCompleteReview,
    setCurrentReview,
    getStatusDotClass,
    isLoading,
    template,
    assessment,
    setShowReviewPanel,
    showReviewPanel,
    setSelectedCategoryId,
    setSelectedRequirementId,
    selectedCategoryId,
    selectedRequirementId,
    isSaving,
    isReviewing,
  };
}
