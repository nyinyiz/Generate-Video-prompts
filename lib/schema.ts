import { promptCategories, type PromptCategory, type PromptRecord } from "../types/prompt";

export { promptCategories };
export type { PromptCategory, PromptRecord };

const promptCategorySet = new Set<string>(promptCategories);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isDateOnly(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  );
}

function isPromptId(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}-[a-z-]+-\d{3}$/.test(value);
}

function isIsoDateTime(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => isNonEmptyString(item));
}

function hasValidPromptLines(value: string) {
  const lines = value
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  return lines.length >= 3 && lines.length <= 5;
}

export function isPromptRecord(value: unknown): value is PromptRecord {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;

  return (
    isPromptId(record.id) &&
    isDateOnly(record.date) &&
    isNonEmptyString(record.category) &&
    promptCategorySet.has(record.category) &&
    isNonEmptyString(record.title) &&
    isNonEmptyString(record.prompt) &&
    hasValidPromptLines(record.prompt) &&
    isStringArray(record.tags) &&
    isIsoDateTime(record.createdAt)
  );
}

export function assertPromptRecord(value: unknown): asserts value is PromptRecord {
  if (!isPromptRecord(value)) {
    throw new Error("Invalid prompt record");
  }
}

export function validatePromptRecords(value: unknown): PromptRecord[] {
  if (!Array.isArray(value)) {
    throw new Error("Prompt dataset must be an array");
  }

  value.forEach(assertPromptRecord);
  return value;
}
