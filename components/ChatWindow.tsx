"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  resumeContent: string;
  fileName: string;
}

const MAX_MESSAGE_PAIRS = 10; // Keep last 10 message pairs (user + assistant)

export default function ChatWindow({ resumeContent, fileName }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-send resume summary when resume is uploaded
  useEffect(() => {
    if (resumeContent && !hasInitialized) {
      sendResumeSummaryRequest();
      setHasInitialized(true);
    }
  }, [resumeContent, hasInitialized]);

  const sendResumeSummaryRequest = async () => {
    setIsLoading(true);
    setError("");

    try {
      const summaryPrompt = `Please provide a comprehensive summary of this resume, highlighting key strengths, experience, skills, and any areas that could be improved:`;

      const systemContext = `You are an expert resume coach helping students improve their resumes. 
Here is the student's resume:

---
${resumeContent}
---

Please provide constructive feedback and suggestions to improve the resume. Be specific and actionable.`;

      const apiMessages: Message[] = [
        {
          role: "user",
          content: `${systemContext}\n\n${summaryPrompt}`,
        },
      ];

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `API error: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Add both user and assistant messages to chat
      setMessages([
        { role: "user", content: summaryPrompt },
        { role: "assistant", content: data.content },
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get resume summary";
      setError(errorMessage);
      console.error("Resume summary error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const enforceMemoryLimit = (messageList: Message[]): Message[] => {
    // Keep only the last 10 message pairs (20 messages total: 10 user + 10 assistant)
    const maxMessages = MAX_MESSAGE_PAIRS * 2;
    if (messageList.length > maxMessages) {
      return messageList.slice(-maxMessages);
    }
    return messageList;
  };

  const updateResumeFilesIfNeeded = async (content: string) => {
    // Check if the assistant response contains edited resume content
    // Keywords that indicate an edited/updated resume is being provided
    const resumeIndicators = [
      "here's your updated resume",
      "here's the improved resume",
      "updated resume",
      "enhanced resume",
      "revised resume",
      "here's the formatted resume",
      "here's a better version",
      "here's an improved version",
      "revised version of your resume",
    ];

    const containsResume = resumeIndicators.some((indicator) =>
      content.toLowerCase().includes(indicator)
    );

    // Also check if content contains structured resume data (Education, Experience, etc.)
    const hasResumeStructure =
      (content.toLowerCase().includes("education") ||
        content.toLowerCase().includes("experience") ||
        content.toLowerCase().includes("skills")) &&
      (content.includes("•") || content.includes("-") || content.includes("*"));

    if ((containsResume || hasResumeStructure) && fileName) {
      try {
        await fetch("/api/update-resume-files", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            aiSuggestion: content,
            originalResume: resumeContent, // Include the original resume for context
            fileName: fileName, // Send the full filename with extension
          }),
        });
        console.log("Resume files updated successfully");
      } catch (err) {
        console.error("Failed to update resume files:", err);
        // Don't throw error - this is a background update
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !resumeContent) return;

    setError("");
    const userMessage = input.trim();
    setInput("");

    // Add user message to chat
    const newUserMessage: Message = { role: "user", content: userMessage };
    let updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Build context with resume content + message history
      const systemContext = `You are an expert resume coach helping students improve their resumes. 
Here is the student's resume:

---
${resumeContent}
---

Please provide constructive feedback and suggestions to improve the resume. Be specific and actionable.`;

      // Prepare messages for API - always include system context in first user message
      const apiMessages: Message[] = [
        {
          role: "user",
          content: `${systemContext}\n\nHere is our conversation history:`,
        },
        // Add previous messages (cycling memory)
        ...updatedMessages.slice(0, -1),
        // Add current user message
        { role: "user", content: userMessage },
      ];

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `API error: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Add assistant message to chat
      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
      };

      // Update messages with assistant response
      updatedMessages = [...updatedMessages, assistantMessage];

      // Enforce memory limit (keep last 10 message pairs)
      updatedMessages = enforceMemoryLimit(updatedMessages);

      setMessages(updatedMessages);

      // Background task: Check if AI provided an updated resume and update files
      updateResumeFilesIfNeeded(data.content);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get response";
      setError(errorMessage);
      console.error("Chat error:", err);

      // Remove the user message if API call failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-6 h-full bg-slate-950 border-blue-800">
      <h2 className="text-lg font-semibold text-white">Chat with Gemini</h2>

      {!resumeContent && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-yellow-600/50 bg-yellow-900/30 p-4 text-center">
          <p className="font-medium text-yellow-300">
            Please upload a resume to start chatting
          </p>
          <p className="text-sm text-yellow-400">
            Once uploaded, you can ask Gemini questions about improving your
            resume
          </p>
        </div>
      )}

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto rounded-lg bg-black p-4 max-h-[500px] scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-blue-900">
        {messages.length === 0 && resumeContent && (
          <div className="flex flex-col items-center justify-center gap-2 text-center h-full">
          </div>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white w-fit max-w-[80%]"
                    : "bg-slate-400/30 text-white w-full mr-12"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap break-words text-sm">
                    {msg.content}
                  </p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <span className="text-sm text-blue-300">
                  Gemini is thinking...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-600/50 bg-red-900/30 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          type="text"
          placeholder={
            resumeContent
              ? "Ask Gemini about your resume..."
              : "Upload a resume first"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading || !resumeContent}
          className="flex-1 bg-blue-800 border-blue-800 text-white placeholder:text-blue-400"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim() || !resumeContent}
          className="px-6 bg-blue-600 hover:bg-blue-500"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </Card>
  );
}