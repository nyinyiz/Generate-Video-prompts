import rawPrompts from "../data/prompts.json";
import { validatePromptRecords } from "./schema";
import type { PromptRecord } from "../types/prompt";

export type PromptSection = "today" | "previous";

export type PromptEntry = {
  id: string;
  section: PromptSection;
  date: string;
  title: string;
  category: string;
  tags: string[];
  prompt: string;
  createdAt: string;
  updatedAt?: string;
};

type PromptFilter = {
  query?: string;
  category?: string;
};

function isPromptSection(value: unknown): value is PromptSection {
  return value === "today" || value === "previous";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isPromptEntry(value: unknown): value is PromptEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Partial<PromptEntry>;

  return (
    typeof entry.id === "string" &&
    isPromptSection(entry.section) &&
    typeof entry.date === "string" &&
    typeof entry.title === "string" &&
    typeof entry.category === "string" &&
    isStringArray(entry.tags) &&
    typeof entry.prompt === "string" &&
    typeof entry.createdAt === "string" &&
    (entry.updatedAt === undefined || typeof entry.updatedAt === "string")
  );
}

function comparePrompts(left: PromptRecord, right: PromptRecord) {
  const leftTime = left.updatedAt || left.createdAt;
  const rightTime = right.updatedAt || right.createdAt;
  return (
    rightTime.localeCompare(leftTime) ||
    right.date.localeCompare(left.date) ||
    left.title.localeCompare(right.title)
  );
}

export function normalizePrompts(records: PromptRecord[]): PromptEntry[] {
  const sortedRecords = [...records].sort(comparePrompts);
  const latestDate = sortedRecords[0]?.date ?? "";

  return sortedRecords.map((record) => ({
    ...record,
    section: record.date === latestDate ? "today" : "previous",
  }));
}

const parsedRecords = validatePromptRecords(rawPrompts);

export const prompts: PromptEntry[] = normalizePrompts(parsedRecords).filter(isPromptEntry);

export function getPromptCategories(promptList: PromptEntry[]) {
  return ["All", ...new Set(promptList.map((prompt) => prompt.category))].sort((left, right) => {
    if (left === "All") {
      return -1;
    }

    if (right === "All") {
      return 1;
    }

    return left.localeCompare(right);
  });
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function filterPrompts(promptList: PromptEntry[], filter: PromptFilter) {
  const query = normalize(filter.query ?? "");
  const category = filter.category ?? "All";

  return promptList.filter((prompt) => {
    const categoryMatches = category === "All" || prompt.category === category;
    const searchMatches =
      query.length === 0 ||
      [
        prompt.title,
        prompt.category,
        ...prompt.tags,
      ].some((field) => normalize(field).includes(query));

    return categoryMatches && searchMatches;
  });
}
