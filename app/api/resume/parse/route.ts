import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

type ResumeParseBody = {
  base64: string;
  mimeType: string;
};

const MAX_RESUME_CHARACTERS = 6000;

export async function POST(request: Request) {
  const body = (await request.json()) as ResumeParseBody;
  const { base64, mimeType } = body;

  if (!base64) {
    return NextResponse.json({ success: false, error: "No resume file provided." }, { status: 400 });
  }

  if (mimeType && mimeType !== "application/pdf") {
    return NextResponse.json({ success: false, error: "Only PDF resumes are supported for upload." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(base64, "base64");
    const parsed = await pdfParse(buffer);
    const text = parsed.text.trim().slice(0, MAX_RESUME_CHARACTERS);

    if (!text) {
      return NextResponse.json({ success: false, error: "Couldn't extract any text from this PDF." }, { status: 422 });
    }

    return NextResponse.json({ success: true, text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to parse this resume.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
