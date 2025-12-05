import { Card } from "@/components/ui/card";
import { Upload, MessageSquare, Download, Copy } from "lucide-react";

export default function UserInstructions() {
  return (
    <div className="mt-12 mb-8">
      {/* Welcome Section */}
      <Card className="mb-8 p-8 bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-blue-700">
        <h2 className="text-3xl font-bold text-white mb-3">Welcome to LaTeXGPT</h2>
        <p className="text-lg text-slate-300 mb-4">
          Your AI-powered resume coach that helps you craft professional LaTeX resumes using Jake's industry-standard template.
        </p>
        <p className="text-slate-400">
          Upload your resume, chat with our AI assistant for personalized feedback, and download a beautifully formatted LaTeX file ready for compilation.
        </p>
      </Card>

      {/* How It Works */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-6">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Step 1: Upload */}
          <Card className="p-6 bg-blue-950 border-blue-800 hover:border-blue-600 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="h-6 w-6 text-blue-400" />
              <h4 className="text-lg font-semibold text-white">Step 1: Upload</h4>
            </div>
            <p className="text-slate-300 text-sm">
              Drag and drop or select your resume file (PDF, DOCX, or TXT). Your file is processed securely on our servers.
            </p>
          </Card>

          {/* Step 2: Chat */}
          <Card className="p-6 bg-blue-950 border-blue-800 hover:border-blue-600 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="h-6 w-6 text-blue-400" />
              <h4 className="text-lg font-semibold text-white">Step 2: Chat</h4>
            </div>
            <p className="text-slate-300 text-sm">
              Get instant AI feedback and suggestions. Ask for specific improvements like "Make my bullet points more impactful" or "Highlight my technical skills."
            </p>
          </Card>

          {/* Step 3: Review */}
          <Card className="p-6 bg-blue-950 border-blue-800 hover:border-blue-600 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="h-6 w-6 text-blue-400" />
              <h4 className="text-lg font-semibold text-white">Step 3: Review</h4>
            </div>
            <p className="text-slate-300 text-sm">
              Watch as your LaTeX file automatically updates with improvements. The AI maintains your original content while incorporating enhancements.
            </p>
          </Card>

          {/* Step 4: Download */}
          <Card className="p-6 bg-blue-950 border-blue-800 hover:border-blue-600 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Download className="h-6 w-6 text-blue-400" />
              <h4 className="text-lg font-semibold text-white">Step 4: Download</h4>
            </div>
            <p className="text-slate-300 text-sm">
              Download your enhanced resume as a .tex file formatted with Jake's professional template, ready for LaTeX compilation.
            </p>
          </Card>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Key Features */}
        <Card className="p-6 bg-slate-900 border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Key Features</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold mt-1">✓</span>
              <div>
                <p className="text-white font-semibold">AI-Powered Feedback</p>
                <p className="text-slate-400 text-sm">Get constructive suggestions from Gemini AI</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold mt-1">✓</span>
              <div>
                <p className="text-white font-semibold">Professional LaTeX Format</p>
                <p className="text-slate-400 text-sm">Uses Jake's industry-standard resume template</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold mt-1">✓</span>
              <div>
                <p className="text-white font-semibold">Instant Updates</p>
                <p className="text-slate-400 text-sm">LaTeX files auto-update as you chat</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold mt-1">✓</span>
              <div>
                <p className="text-white font-semibold">Context Preservation</p>
                <p className="text-slate-400 text-sm">AI remembers your original resume while improving it</p>
              </div>
            </li>
          </ul>
        </Card>

        {/* Tips & Best Practices */}
        <Card className="p-6 bg-slate-900 border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Tips for Best Results</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-amber-400 font-bold mt-1">→</span>
              <div>
                <p className="text-white font-semibold">Be Specific</p>
                <p className="text-slate-400 text-sm">Ask for improvements on specific sections (e.g., "Improve my experience bullets")</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 font-bold mt-1">→</span>
              <div>
                <p className="text-white font-semibold">Iterate</p>
                <p className="text-slate-400 text-sm">Chat multiple times to refine your resume progressively</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 font-bold mt-1">→</span>
              <div>
                <p className="text-white font-semibold">Review Changes</p>
                <p className="text-slate-400 text-sm">Check the chat to see AI suggestions before downloading</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 font-bold mt-1">→</span>
              <div>
                <p className="text-white font-semibold">Compile Online</p>
                <p className="text-slate-400 text-sm">Download the .tex file and compile online with Overleaf or CriXet!</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="p-6 bg-slate-900 border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Export Your Resume</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-4">
            <Download className="h-5 w-5 text-blue-400 mt-1" />
            <div>
              <p className="text-white font-semibold">Download as .tex</p>
              <p className="text-slate-400 text-sm">Get your formatted LaTeX file ready for compilation with any LaTeX editor</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Copy className="h-5 w-5 text-blue-400 mt-1" />
            <div>
              <p className="text-white font-semibold">Copy to Clipboard</p>
              <p className="text-slate-400 text-sm">Copy the LaTeX code directly to paste into your favorite editor</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy Note */}
      <Card className="mt-8 p-4 bg-green-950/20 border-green-800">
        <p className="text-green-300 text-sm">
          <span className="font-semibold">🔒 Privacy:</span> All uploaded files are processed securely and deleted automatically when you refresh the page. No user data is stored on our servers.
        </p>
      </Card>
    </div>
  );
}