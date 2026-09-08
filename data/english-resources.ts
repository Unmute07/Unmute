export type EnglishResource = {
  title: string;
  url: string;
  description: string;
};

// Populate this list with recommended English-learning resources. Shown on the
// feedback page whenever a candidate's English proficiency score is below 65.
export const ENGLISH_RESOURCES: EnglishResource[] = [
  {
    title: "British Council — Learn English",
    url: "https://learnenglish.britishcouncil.org/free-resources",
    description: "Free lessons, listening practice, and grammar exercises from the British Council.",
  },
  {
    title: "BBC Learning English",
    url: "https://www.youtube.com/@bbclearningenglish",
    description: "Video lessons on vocabulary, grammar, and pronunciation for everyday and professional English.",
  },
  {
    title: "VOA Learning English",
    url: "https://learningenglish.voanews.com/",
    description: "News-based articles and audio at a slower pace, ideal for building listening and reading fluency.",
  },
  {
    title: "Tandem",
    url: "https://tandem.net/",
    description: "Practice speaking with native English speakers through language exchange.",
  },
  {
    title: "Grammarly (Free)",
    url: "https://www.grammarly.com/free",
    description: "Real-time grammar, clarity, and tone feedback while you write.",
  },
];
