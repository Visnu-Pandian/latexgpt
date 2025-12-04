import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const downloadsDir = join(process.cwd(), "tmp", "downloads");

export async function POST(request: NextRequest) {
  try {
    const { fileName } = await request.json();

    if (!fileName) {
      return NextResponse.json(
        { error: "Missing fileName" },
        { status: 400 }
      );
    }

    // Construct the file path - fileName should already include timestamp and full name
    const filePath = join(downloadsDir, fileName);

    // Read the file content
    const content = await readFile(filePath, "utf-8");

    return NextResponse.json({
      success: true,
      content: content,
    });
  } catch (error) {
    console.error("Read resume file error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to read resume file" },
      { status: 500 }
    );
  }
}
