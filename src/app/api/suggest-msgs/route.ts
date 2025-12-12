import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const FALLBACK_SETS = [
  "What's a skill you'd love to master one day?||If you could invent a new color, what would it look like and what would you name it?||What's a simple pleasure that always brightens your day?",

  "What's a movie you can watch 100 times and never get bored?||If you could have dinner with any fictional character, who would it be?||What's your go-to comfort food when life gets heavy?",

  "What's a song that instantly puts you in a good mood?||If you could live one day from your childhood again, which day would it be?||What's something small that made you smile today?",

  "What's a book that completely changed how you see the world?||If you could send a message to your past self, what would you say?||What's your favorite way to spend a lazy Sunday?",
];

let fallbackIndex = 0;

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Separate them only with "||". No numbering, no quotes, no extra text.
    Create exactly 3 fresh, fun, open-ended, and friendly questions for an anonymous messaging app.

    What's a hobby you've picked up recently?||If you could teleport anywhere right now, where would you go?||What's your happy place?
    Example format:
    
    Make them positive, universal, and conversation-starting. Never repeat previous questions.
    `;

    const result = await model.generateContent(prompt);

    let text = result.response?.text()?.trim();

    if (text && text.includes("||") && text.split("||").length >= 2) {
      fallbackIndex = 0;
      return new NextResponse(text, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    throw new Error("Invalid response from AI");
  } catch (err) {
    console.log("Gemini failed → using fallback set", err);
    const selectedSet = FALLBACK_SETS[fallbackIndex];
    fallbackIndex = (fallbackIndex + 1) % FALLBACK_SETS.length; // cycle through 4 sets

    return new NextResponse(selectedSet, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
