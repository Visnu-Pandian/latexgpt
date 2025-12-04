import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build chat history for context (Gemini expects alternating user/model messages)
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    // Start a chat session with history
    const chat = model.startChat({
      history: history,
    });

    // Send the message and get response
    const result = await chat.sendMessage(latestMessage.content);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({
      role: "assistant",
      content: text,
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to process request" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}