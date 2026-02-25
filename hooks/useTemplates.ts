import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";

export interface Template {
  id: string;
  title: string;
  status: "PROCESSING" | "AVAILABLE" | "FAILED";
  categoriesCount?: number;
  requirementsCount?: number;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  requirements: Requirement[];
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
}

export interface TemplateDetail extends Template {
  categories: Category[];
}

export function useTemplates() {
  return useQuery<Template[]>({
    queryKey: ["templates"],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch("/api/templates", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json();
    },
  });
}

export function useTemplate(templateId: string) {
  return useQuery<TemplateDetail>({
    queryKey: ["template", templateId],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`/api/templates/${templateId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch template");
      return response.json();
    },
    enabled: !!templateId,
  });
}

export function useUploadTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      const response = await fetch("/api/templates/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
