import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import os from "os";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const downloadsDir = join(os.tmpdir(), "downloads");

// Helper function to clean LaTeX content (remove markdown code fence backticks)
const cleanLatexContent = (content: string): string => {
  return content.replace(/^```latex\n?/i, "").replace(/\n?```$/i, "");
};

export async function POST(request: NextRequest) {
  try {
    const { aiSuggestion, originalResume, fileName } = await request.json();

    if (!aiSuggestion || !originalResume || !fileName) {
      return NextResponse.json(
        { error: "Missing aiSuggestion, originalResume, or fileName" },
        { status: 400 }
      );
    }

    // Generate updated TEX version using Jake's template with context of original resume
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Read Jake's template for TEX generation
    const templatePath = join(
      process.cwd(),
      "components",
      "jakes_template.tex"
    );
    const jakeTemplate = await readFile(templatePath, "utf-8");

    // Generate updated TEX version
    const texResponse = await model.generateContent([
      {
        text: `You are a LaTeX resume formatting expert. Below is Jake's Professional Resume Template that you must follow EXACTLY.

Jake's Template (use this as the structure and formatting reference):
\`\`\`
${jakeTemplate}
\`\`\`

Original resume:
${originalResume}

Updated resume with AI suggestions:
${aiSuggestion}

Now, take the updated resume content provided and reformat it to follow Jake's template EXACTLY:
- Use the same document class, packages, and preamble as Jake's template
- Use the custom commands defined in Jake's template: \\resumeSubheading, \\resumeProjectHeading, \\resumeItemListStart, \\resumeItemListEnd, \\resumeItem
- Match the formatting, spacing, and structure of Jake's template
- Keep all custom LaTeX commands and styling from Jake's template
- Fill in the resume content where appropriate in the template structure
- Do NOT create your own template - ONLY use Jake's template structure
- Maintain consistency with the original resume while incorporating the AI suggestions

Return the COMPLETE, valid LaTeX document following Jake's template structure exactly. Include the full preamble, all packages, and all custom commands from Jake's template.`,
      },
    ]);

    const texContent = texResponse.response.text();

    // Extract timestamp and original name from fileName
    // fileName format: "1764835999000_GLENN_ETHAN_WVU.tex"
    const fileNameWithoutExt = fileName.replace(/\.[^.]+$/, ""); // Remove .tex extension
    const parts = fileNameWithoutExt.split("_");
    const timestamp = parts[0];
    const originalName = parts.slice(1).join("_");

    // Update the saved LaTeX file
    const texPath = join(downloadsDir, `${timestamp}_${originalName}.tex`);

    await writeFile(texPath, cleanLatexContent(texContent), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Files updated successfully",
      texContent,
    });
  } catch (error) {
    console.error("Update files error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update files" },
      { status: 500 }
    );
  }
}
