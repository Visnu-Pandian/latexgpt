"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X } from "lucide-react";

interface ResumeUploadProps {
  onResumeUpload: (content: string, fileName: string) => void;
}

export default function ResumeUpload({ onResumeUpload }: ResumeUploadProps) {
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const ALLOWED_TYPES = [
    "text/plain",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFile = async (file: File) => {
    setError("");
    setIsLoading(true);

    try {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `File size exceeds 20MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`
        );
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(
          "Invalid file type. Please upload a .txt, .pdf, or .docx file"
        );
      }

      // Upload file to server
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload resume");
      }

      const data = await response.json();

      setFileName(data.texFileName);
      // Pass the resume content (DOCX version) to the chat and the full timestamped tex filename
      onResumeUpload(data.resumeContent, data.texFileName);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload file";
      setError(errorMessage);
      setFileName("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClear = () => {
    setFileName("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-6 bg-blue-975 border-blue-800">
      <h2 className="text-lg font-semibold text-white">Upload Resume</h2>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed py-8 px-4 transition-colors ${
          isDragActive
            ? "border-blue-400 bg-blue-900/40"
            : "border-blue-700 hover:border-blue-600 dark:border-blue-700"
        }`}
      >
        <Upload className="h-8 w-8 text-blue-400" />
        <div className="text-center">
          <p className="font-medium text-blue-100">
            Drag and drop your resume here
          </p>
          <p className="text-sm text-blue-300">
            or click to browse
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,.docx"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="hidden"
          aria-label="Upload resume file"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          variant="outline"
          className="border-blue-600 text-blue-200 hover:bg-blue-600"
        >
          {isLoading ? "Processing..." : "Select File"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-600/50 bg-red-900/30 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {fileName && (
        <div className="flex items-center justify-between rounded-lg border border-green-600/50 bg-green-900/30 p-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-green-500" />
            <div>
              <p className="font-medium text-green-300">
                {fileName}
              </p>
              <p className="text-xs text-green-400">
                Uploaded successfully
              </p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="text-green-400 hover:text-green-300"
            aria-label="Clear uploaded file"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <p className="text-xs text-blue-300">
        Supported formats: .txt, .pdf, .docx (Max 20MB)
      </p>
    </Card>
  );
}