"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check, Code } from "lucide-react";

interface ResumeDownloadProps {
  resumeContent: string;
  fileName: string;
}

export default function ResumeDownload({
  resumeContent,
  fileName,
}: ResumeDownloadProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadLatex = async () => {
    if (!resumeContent || !fileName) return;

    try {
      setDownloading("latex");
      const response = await fetch("/api/read-resume-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: fileName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to read LaTeX file");
      }

      const data = await response.json();

      // Download the LaTeX file
      const blob = new Blob([data.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const element = document.createElement("a");
      element.href = url;
      element.download = `enhanced_${fileName || "resume.tex"}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("LaTeX download error:", error);
      alert("Failed to download LaTeX file");
    } finally {
      setDownloading(null);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!resumeContent || !fileName) return;

    try {
      setDownloading("copy");
      const response = await fetch("/api/read-resume-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: fileName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to read LaTeX file");
      }

      const data = await response.json();

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(data.content);
      } else {
        // Fallback for older browsers or environments without clipboard API
        const textarea = document.createElement("textarea");
        textarea.value = data.content;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy LaTeX to clipboard");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-6 bg-blue-975 border-blue-800">
      <h2 className="text-lg font-semibold text-white">Download Resume</h2>

      {!resumeContent ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-blue-700 bg-blue-900/30 p-6 text-center">
          <p className="font-medium text-blue-200">
            No resume to download
          </p>
          <p className="text-sm text-blue-300">
            Upload and enhance a resume first, then download it here
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-green-600/50 bg-green-900/30 p-4">
            <p className="text-sm font-medium text-green-300">
              ✓ Resume ready for download
            </p>
            {fileName && (
              <p className="text-xs text-green-400 mt-1">
                Original file: {fileName}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleDownloadLatex}
              disabled={downloading !== null}
              variant="default"
              className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
            >
              <Code className="h-4 w-4" />
              {downloading === "latex" ? "Generating..." : "Download as .tex"}
            </Button>

            <Button
              onClick={handleCopyToClipboard}
              disabled={downloading !== null}
              variant="outline"
              className="w-full gap-2 border-blue-600 text-blue-200 hover:bg-blue-900 disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy LaTeX to Clipboard
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg border border-blue-700 bg-blue-900/40 p-3 text-xs text-blue-200">
            <p className="font-medium mb-2">📝 Export options:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>.tex</strong> - LaTeX format using professional template structure</li>
              <li><strong>Clipboard</strong> - Copy LaTeX code for pasting into other applications</li>
            </ul>
          </div>
        </>
      )}
    </Card>
  );
}
