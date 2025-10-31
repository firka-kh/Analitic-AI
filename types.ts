export enum QuestionType {
  Radio = 'radio',
  Checkbox = 'checkbox',
  Scale = 'scale',
  Text = 'text',
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

export interface Survey {
  id:string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Record<string, string | string[] | number>;
  submittedAt: string;
}

export interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
}

export interface KeyTheme {
  theme: string;
  description: string;
}

export interface Quote {
  theme: string;
  quotes: string[];
}

export interface AIAnalysisResult {
  sentiment: SentimentData;
  keyThemes: KeyTheme[];
  summary: string;
  quotes: Quote[];
}

export interface GroundingSource {
  uri: string;
  title: string;
}
