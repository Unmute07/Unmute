import { NextResponse } from "next/server";

import {
  analyzeJobDescription,
  generateInterviewQuestions,
  evaluateAnswer,
  evaluateSpokenDelivery,
  generateStudyPlan,
  generateInterviewSummary,
  type InterviewRecordLike,
} from "@/services/ai.service";

type AiRequestBody =
  | { action: "analyzeJobDescription"; payload: { jobDescription: string } }
  | {
      action: "generateInterviewQuestions";
      payload: { jobDescription: string; role: string; experienceLevel: string; interviewType: string };
    }
  | { action: "evaluateAnswer"; payload: { question: string; answer: string } }
  | { action: "evaluateSpokenDelivery"; payload: { question: string; audioBase64: string; mimeType: string } }
  | { action: "generateStudyPlan"; payload: { feedback: string } }
  | { action: "generateInterviewSummary"; payload: { interview: InterviewRecordLike } };

export async function POST(request: Request) {
  const body = (await request.json()) as AiRequestBody;

  switch (body.action) {
    case "analyzeJobDescription": {
      const result = await analyzeJobDescription(body.payload.jobDescription);
      return NextResponse.json(result);
    }
    case "generateInterviewQuestions": {
      const { jobDescription, role, experienceLevel, interviewType } = body.payload;
      const result = await generateInterviewQuestions(jobDescription, role, experienceLevel, interviewType);
      return NextResponse.json(result);
    }
    case "evaluateAnswer": {
      const { question, answer } = body.payload;
      const result = await evaluateAnswer(question, answer);
      return NextResponse.json(result);
    }
    case "evaluateSpokenDelivery": {
      const { question, audioBase64, mimeType } = body.payload;
      const result = await evaluateSpokenDelivery(question, audioBase64, mimeType);
      return NextResponse.json(result);
    }
    case "generateStudyPlan": {
      const result = await generateStudyPlan(body.payload.feedback);
      return NextResponse.json(result);
    }
    case "generateInterviewSummary": {
      const result = await generateInterviewSummary(body.payload.interview);
      return NextResponse.json(result);
    }
    default: {
      return NextResponse.json({ success: false, error: "Unknown AI action." }, { status: 400 });
    }
  }
}
