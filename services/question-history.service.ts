import { addDoc, collection, getDocs, limit, orderBy, query, Timestamp, where } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { InterviewMode, InterviewQuestion } from "@/types/interview";

type AskedQuestionMeta = {
  role: string;
  experienceLevel: string;
  company: string;
  mode: InterviewMode;
};

export async function recordAskedQuestions(
  uid: string,
  questions: InterviewQuestion[],
  meta: AskedQuestionMeta,
): Promise<void> {
  const ref = collection(db, "users", uid, "askedQuestions");
  await Promise.all(
    questions.map((question) =>
      addDoc(ref, {
        question: question.question,
        role: meta.role,
        experienceLevel: meta.experienceLevel,
        company: meta.company,
        mode: meta.mode,
        createdAt: Timestamp.fromDate(new Date()),
      }),
    ),
  );
}

// Practice sessions maximize variety: pull recent questions across every role/company
// so practice never repeats what you've already seen, regardless of context.
export async function fetchRecentQuestionsForPractice(uid: string, take = 50): Promise<string[]> {
  const ref = collection(db, "users", uid, "askedQuestions");
  const snapshot = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(take)));
  return snapshot.docs.map((docSnapshot) => docSnapshot.data().question as string);
}

// Mock interviews only avoid repeats within the same company + role + experience level,
// since a mock is meant to simulate one specific target interview.
export async function fetchRecentQuestionsForMock(
  uid: string,
  filters: { company: string; role: string; experienceLevel: string },
  take = 30,
): Promise<string[]> {
  const ref = collection(db, "users", uid, "askedQuestions");
  const snapshot = await getDocs(
    query(
      ref,
      where("mode", "==", "mock"),
      where("company", "==", filters.company),
      where("role", "==", filters.role),
      where("experienceLevel", "==", filters.experienceLevel),
      orderBy("createdAt", "desc"),
      limit(take),
    ),
  );
  return snapshot.docs.map((docSnapshot) => docSnapshot.data().question as string);
}
