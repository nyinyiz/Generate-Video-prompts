export const promptCategories = [
  "Daily Life",
  "Human Nature",
  "Health",
  "Technology",
  "Motivation",
  "Nature",
  "Society",
] as const;

export type PromptCategory = (typeof promptCategories)[number];

export interface PromptRecord {
  id: string;
  date: string;
  category: PromptCategory;
  title: string;
  prompt: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  camera?: string;
  lighting?: string;
  audio?: string;
}

