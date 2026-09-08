export type ResumeParseResult = { success: true; text: string } | { success: false; error: string };

export async function parseResumePdf(base64: string, mimeType: string): Promise<ResumeParseResult> {
  try {
    const response = await fetch("/api/resume/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64, mimeType }),
    });

    return (await response.json()) as ResumeParseResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach the resume parsing service.";
    return { success: false, error: message };
  }
}
