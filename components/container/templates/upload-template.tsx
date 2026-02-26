"use client";

import { useUploadTemplate } from "@/hooks/useTemplates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, X } from "lucide-react";

export function UploadTemplate() {
  const {
    fileInputRef,
    dragActive,
    selectedFile,
    title,
    isPending,
    handleChange,
    handleDrag,
    handleDrop,
    handleSubmit,
    handleClearFile,
    setTitle,
  } = useUploadTemplate();

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold">Upload Compliance Template</h2>

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30 hover:border-muted-foreground/50"
          }`}
        >
          <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="mb-2 font-medium">Drag and drop your PDF here</p>
          <p className="mb-4 text-sm text-muted-foreground">or</p>

          <Input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleChange}
            disabled={isPending}
            className="hidden"
          />

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            Select File
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 shrink-0 text-red-500" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleClearFile}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {selectedFile && (
        <>
          <div className="mt-4 space-y-2">
            <Label htmlFor="template-title">Template Title</Label>
            <Input
              id="template-title"
              placeholder="Enter template title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
            />
          </div>

          <Button
            className="mt-4 w-full"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Template
              </>
            )}
          </Button>
        </>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        ✓ Supports PDF files up to 50MB
        <br />✓ Will be processed with AI for requirements extraction
      </p>
    </Card>
  );
}
