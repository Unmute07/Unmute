import { NextResponse } from "next/server";

import { uploadAudioFile } from "@/lib/supabase-admin";

type AudioUploadBody = {
  uid: string;
  interviewId: string;
  questionId: string;
  audioBase64: string;
  mimeType: string;
};

function extensionFromMimeType(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "mp4";
  return "webm";
}

export async function POST(request: Request) {
  const body = (await request.json()) as AudioUploadBody;
  const { uid, interviewId, questionId, audioBase64, mimeType } = body;

  if (!uid || !interviewId || !questionId || !audioBase64) {
    return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(audioBase64, "base64");
    const path = `${uid}/${interviewId}/${questionId}.${extensionFromMimeType(mimeType)}`;
    const publicUrl = await uploadAudioFile(path, bytes, mimeType || "audio/webm");

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload audio.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
