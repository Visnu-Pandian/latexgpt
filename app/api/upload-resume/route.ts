import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import mammoth from "mammoth";
import { join } from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const uploadsDir = join(process.cwd(), "public", "files", "uploads");
const downloadsDir = join(process.cwd(), "public", "files", "downloads");

// Helper function to clean LaTeX content (remove markdown code fence backticks)
const cleanLatexContent = (content: string): string => {
  return content.replace(/^```latex\n?/i, "").replace(/\n?```$/i, "");
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF, TXT, or DOCX file" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    await mkdir(uploadsDir, { recursive: true });
    await mkdir(downloadsDir, { recursive: true });
    
    // Save the uploaded file
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-z0-9.-]/gi, "_");
    const fileNameWithTimestamp = `${timestamp}_${sanitizedFileName}`;
    const filePath = join(uploadsDir, fileNameWithTimestamp);

    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    // Extract resume text and generate LaTeX version using Gemini
    const texPath = join(downloadsDir, `${timestamp}_${sanitizedFileName.replace(/\.[^.]+$/, ".tex")}`);

    // Call Gemini to process the resume
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prepare file for Gemini
    let fileContent: any;

    if (file.type === "application/pdf") {
      // For PDF, use inline data
      const base64Data = Buffer.from(buffer).toString("base64");
      fileContent = {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data,
        },
      };
    } else if (file.type === "text/plain") {
      // For TXT, read as text
      const textContent = new TextDecoder().decode(buffer);
      fileContent = {
        text: textContent,
      };
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      // Extracting raw text from docx file
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer: buffer });

      fileContent = {
          text: result.value,
      };
    }

    // Extract resume text from the uploaded file
    const textResponse = await model.generateContent([
      {
        text: "You are a resume parsing expert. Extract all text content from this resume and return ONLY the formatted text content, nothing else.",
      },
      fileContent,
    ]);

    const resumeText = textResponse.response.text();

    // Read Jake's template for TEX generation
    const templatePath = join(
      process.cwd(),
      "public",
      "files",
      "templates",
      "jakes_template.tex"
    );
    const jakeTemplate = await readFile(templatePath, "utf-8");

    // Generate TEX version using Jake's template
    const texResponse = await model.generateContent([
      {
        text: `You are a LaTeX resume formatting expert. Below is Jake's Professional Resume Template that you must follow EXACTLY.

Jake's Template (use this as the structure and formatting reference):
\`\`\`
${jakeTemplate}
\`\`\`

Now, take the resume content provided and reformat it to follow Jake's template EXACTLY:
- Use the same document class, packages, and preamble as Jake's template
- Use the custom commands defined in Jake's template: \\resumeSubheading, \\resumeProjectHeading, \\resumeItemListStart, \\resumeItemListEnd, \\resumeItem
- Match the formatting, spacing, and structure of Jake's template
- Keep all custom LaTeX commands and styling from Jake's template
- Fill in the resume content where appropriate in the template structure
- Do NOT create your own template - ONLY use Jake's template structure

Return the COMPLETE, valid LaTeX document following Jake's template structure exactly. Include the full preamble, all packages, and all custom commands from Jake's template.`,
      },
      fileContent,
    ]);

    const texContent = texResponse.response.text();

    // Save TEX file
    await writeFile(texPath, cleanLatexContent(texContent), "utf-8");

    return NextResponse.json({
      success: true,
      fileName: sanitizedFileName,
      uploadedFileName: fileNameWithTimestamp,
      texFileName: `${timestamp}_${sanitizedFileName.replace(/\.[^.]+$/, ".tex")}`,
      resumeContent: resumeText, // Return the extracted resume text for the chat
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload resume" },
      { status: 500 }
    );
  }
}
