import { NextResponse } from "next/server";

import {
  analyzeJobDescription,
  generateInterviewQuestions,
  evaluateAnswer,
  evaluateSpokenDelivery,
  generateInterviewSummary,
  generateFollowUpQuestion,
  transcribeAnswer,
  type AnswerEvaluationContext,
  type FollowUpContext,
  type FollowUpTranscriptItem,
  type InterviewRecordLike,
  type InterviewTranscriptItem,
  type QuestionCount,
} from "@/services/ai.service";

type AiRequestBody =
  | { action: "analyzeJobDescription"; payload: { jobDescription: string } }
  | {
      action: "generateInterviewQuestions";
      payload: {
        jobDescription: string;
        role: string;
        experienceLevel: string;
        interviewType: string;
        questionCount?: QuestionCount;
        difficulty?: string;
        resumeText?: string;
        avoidQuestions?: string[];
        includeFollowUps?: boolean;
      };
    }
  | { action: "evaluateAnswer"; payload: { question: string; answer: string; context?: AnswerEvaluationContext } }
  | { action: "evaluateSpokenDelivery"; payload: { question: string; audioBase64: string; mimeType: string } }
  | { action: "transcribeAnswer"; payload: { audioBase64: string; mimeType: string } }
  | {
      action: "generateFollowUpQuestion";
      payload: { transcript: FollowUpTranscriptItem[]; context?: FollowUpContext };
    }
  | {
      action: "generateInterviewSummary";
      payload: { interview: InterviewRecordLike; transcript: InterviewTranscriptItem[] };
    };

export async function POST(request: Request) {
  const body = (await request.json()) as AiRequestBody;

  switch (body.action) {
    case "analyzeJobDescription": {
      const result = await analyzeJobDescription(body.payload.jobDescription);
      return NextResponse.json(result);
    }
    case "generateInterviewQuestions": {
      const {
        jobDescription,
        role,
        experienceLevel,
        interviewType,
        questionCount,
        difficulty,
        resumeText,
        avoidQuestions,
        includeFollowUps,
      } = body.payload;
      const result = await generateInterviewQuestions(
        jobDescription,
        role,
        experienceLevel,
        interviewType,
        questionCount,
        difficulty,
        resumeText,
        avoidQuestions,
        includeFollowUps,
      );
      return NextResponse.json(result);
    }
    case "evaluateAnswer": {
      const { question, answer, context } = body.payload;
      const result = await evaluateAnswer(question, answer, context);
      return NextResponse.json(result);
    }
    case "evaluateSpokenDelivery": {
      const { question, audioBase64, mimeType } = body.payload;
      const result = await evaluateSpokenDelivery(question, audioBase64, mimeType);
      return NextResponse.json(result);
    }
    case "transcribeAnswer": {
      const { audioBase64, mimeType } = body.payload;
      const result = await transcribeAnswer(audioBase64, mimeType);
      return NextResponse.json(result);
    }
    case "generateInterviewSummary": {
      const { interview, transcript } = body.payload;
      const result = await generateInterviewSummary(interview, transcript);
      return NextResponse.json(result);
    }
    case "generateFollowUpQuestion": {
      const { transcript, context } = body.payload;
      const result = await generateFollowUpQuestion(transcript, context);
      return NextResponse.json(result);
    }
    default: {
      return NextResponse.json({ success: false, error: "Unknown AI action." }, { status: 400 });
    }
  }
}
