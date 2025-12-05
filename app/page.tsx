"use client";

import { cleanupDirs } from "@/lib/CleanupDirs";
import { useEffect, useState } from "react";
import Image from "next/image";

import ChatWindow from "@/components/ChatWindow";
import ResumeUpload from "@/components/ResumeUpload";
import ResumeDownload from "@/components/ResumeDownload";
import UserInstructions from "@/components/UserInstructions";

export default function Home() {
  const [resumeContent, setResumeContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [gitHubUsername] = useState<string>("Visnu-Pandian"); // Change this to your GitHub username

    // Run cleanup on component mount
  useEffect(() => {
    cleanupDirs();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 900);
  }, [])
  const handleResumeUpload = (content: string, name: string) => {
    setResumeContent(content);
    setFileName(name);
  };

  return (
    <div className="dark min-h-screen bg-slate-950 p-0">
      {/* Top Bar */}
      <div className="sticky top-0 bg-black border-b border-slate-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              LaTeXGPT
            </h1>
            <p className="text-lg text-slate-400">
              Enhance your resume with AI-powered feedback from Gemini
            </p>
          </div>
          
          {/* GitHub Profile Button */}
          <a
            href={`https://github.com/${gitHubUsername}?v=new`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-slate-800 transition-colors"
            title={`Visit ${gitHubUsername}'s GitHub profile`}
          >
            <Image
              src={`https://avatars.githubusercontent.com/${gitHubUsername}`}
              alt={`${gitHubUsername}'s GitHub profile picture`}
              width={64}
              height={64}
              className="rounded-full border-2 border-slate-700 hover:border-blue-500 transition-colors"
              priority
            />
            <span className="text-xs text-slate-400 hover:text-white transition-colors">
              Made by {gitHubUsername}
            </span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

        {/* Main layout - Chat on top, Upload/Download below */}
        <div className="flex flex-col gap-6 h-full">
          {/* Chat Window - Main section */}
          <div className="flex-1 min-h-96 md:min-h-[500px]">
            <ChatWindow resumeContent={resumeContent} fileName={fileName} />
          </div>

          {/* Upload and Download sections - Split horizontally */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-full">
              <ResumeUpload onResumeUpload={handleResumeUpload} />
            </div>
            <div className="h-full">
              <ResumeDownload resumeContent={resumeContent} fileName={fileName} />
            </div>
          </div>
        </div>

          {/* User Instructions - Above Footer */}
          <UserInstructions />

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-500">
          <p>
            Built with{" "}
            <span className="font-semibold">Next.js</span>,{" "}
            <span className="font-semibold">Tailwind CSS</span>, and{" "}
            <span className="font-semibold">Google Gemini API</span>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}