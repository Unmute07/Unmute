async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function uploadAnswerAudio(
  uid: string,
  interviewId: string,
  questionId: string,
  blob: Blob,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const audioBase64 = await blobToBase64(blob);
    const response = await fetch("/api/audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        interviewId,
        questionId,
        audioBase64,
        mimeType: blob.type || "audio/webm",
      }),
    });

    return (await response.json()) as { success: true; url: string } | { success: false; error: string };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach the audio upload service.";
    return { success: false, error: message };
  }
}
