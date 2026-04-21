import assert from "node:assert/strict";
import test from "node:test";

import { filterPrompts, normalizePrompts } from "../lib/prompts";
import type { PromptRecord } from "../types/prompt";

const samplePrompts: PromptRecord[] = [
  {
    id: "2026-04-21-daily-life-001",
    date: "2026-04-21",
    category: "Daily Life",
    title: "Morning Reset",
    prompt: [
      "Hook: Lead with the visible mess viewers recognize instantly.",
      "Visual: Curtains open, a bed is made, and one table clears out.",
      "Tone: Calm, practical, and reassuring.",
    ].join("\n"),
    tags: ["routine", "home", "reset"],
    createdAt: "2026-04-21T00:00:00.000Z",
  },
  {
    id: "2026-04-20-technology-001",
    date: "2026-04-20",
    category: "Technology",
    title: "AI Assistant in Motion",
    prompt: [
      "Hook: Open with a task people already procrastinate on.",
      "Visual: A phone screen drafts, sorts, and summarizes in quick cuts.",
      "Tone: Smart, clear, and useful.",
    ].join("\n"),
    tags: ["ai", "mobile", "productivity"],
    createdAt: "2026-04-20T00:00:00.000Z",
  },
];

test("normalizePrompts derives today versus previous from the latest dataset date", () => {
  const normalized = normalizePrompts(samplePrompts);

  assert.equal(normalized[0]?.section, "today");
  assert.equal(normalized[0]?.id, "2026-04-21-daily-life-001");
  assert.equal(normalized[1]?.section, "previous");
});

test("filterPrompts searches title, category, and tags", () => {
  const normalized = normalizePrompts(samplePrompts);

  assert.equal(filterPrompts(normalized, { query: "assistant" }).length, 1);
  assert.equal(filterPrompts(normalized, { query: "productivity" }).length, 1);
  assert.equal(filterPrompts(normalized, { category: "Daily Life" }).length, 1);
});
