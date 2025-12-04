import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper function to clean LaTeX content (remove markdown code fence backticks)
const cleanLatexContent = (content: string): string => {
  return content.replace(/^```latex\n?/i, "").replace(/\n?```$/i, "");
};

export async function POST(request: NextRequest) {
  try {
    const { enhancedResume } = await request.json();

    if (!enhancedResume) {
      return NextResponse.json(
        { error: "No resume content provided" },
        { status: 400 }
      );
    }

    // Read Jake's template to use as reference
    const templatePath = join(
      process.cwd(),
      "components",
      "jakes_template.tex"
    );


    const jakeTemplate = await readFile(templatePath, "utf-8");

    // Use Gemini to format the resume following Jake's template
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const texResponse = await model.generateContent(
      `You are a LaTeX resume formatting expert. Below is Jake's Professional Resume Template that you must follow EXACTLY.

Jake's Template (use this as the structure and formatting reference):
\`\`\`
${jakeTemplate}
\`\`\`

Now, take the following resume content and reformat it to follow Jake's template EXACTLY:
- Use the same document class, packages, and preamble as Jake's template
- Use the custom commands defined in Jake's template: \\resumeSubheading, \\resumeProjectHeading, \\resumeItemListStart, \\resumeItemListEnd, \\resumeItem
- Match the formatting, spacing, and structure of Jake's template
- Keep all custom LaTeX commands and styling from Jake's template
- Fill in the resume content where appropriate in the template structure
- Do NOT create your own template - ONLY use Jake's template structure

Resume content to format:
${enhancedResume}

Return the COMPLETE, valid LaTeX document following Jake's template structure exactly. Include the full preamble, all packages, and all custom commands from Jake's template.`
    );

    const latexDocument = texResponse.response.text();

    return NextResponse.json({
      success: true,
      latex: cleanLatexContent(latexDocument),
    });
  } catch (error) {
    console.error("LaTeX generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate LaTeX" },
      { status: 500 }
    );
  }
}
