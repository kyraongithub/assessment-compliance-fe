import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";

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
