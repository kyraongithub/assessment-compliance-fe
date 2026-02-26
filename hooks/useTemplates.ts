import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { useRef, useState } from "react";
import { toast } from "sonner";

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const { mutate, isPending } = useMutation({
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
    onSuccess: (data) => {
      toast.success(`Template "${data.title}" uploaded! Processing started.`);

      queryClient.invalidateQueries({ queryKey: ["templates"] });

      // Reset state
      setSelectedFile(null);
      setTitle("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: () => {
      toast.error("Failed to upload template");
    },
  });

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    setSelectedFile(file);

    if (!title) {
      setTitle(file.name.replace(/\.pdf$/i, ""));
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file");
      return;
    }

    const finalTitle = title.trim() || selectedFile.name.replace(/\.pdf$/i, "");

    mutate({ file: selectedFile, title: finalTitle });
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setTitle("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return {
    fileInputRef,
    dragActive,
    selectedFile,
    title,
    isPending,
    setTitle,
    handleChange,
    handleDrag,
    handleDrop,
    handleSubmit,
    handleClearFile,
  };
}
