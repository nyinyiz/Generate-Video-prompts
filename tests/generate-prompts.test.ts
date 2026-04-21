import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  generatePrompts,
  isDuplicateEntry,
  main,
} from "../scripts/generate-prompts";
import { promptCategories, validatePromptRecords } from "../lib/schema";
import type { PromptRecord } from "../types/prompt";

function makeRecord(
  overrides: Partial<PromptRecord>,
  categoryIndex: number,
): PromptRecord {
  const category = promptCategories[categoryIndex % promptCategories.length];
  const date = overrides.date ?? "2026-04-20";
  const slug = category.toLowerCase().replace(/\s+/g, "-");

  return {
    id: overrides.id ?? `${date}-${slug}-001`,
    date,
    category,
    title: overrides.title ?? `${category} Prompt`,
    prompt:
      overrides.prompt ??
      [
        "Hook: Lead with a concrete tension point viewers feel right away.",
        "Visual: Show a simple sequence with clear movement and cinematic focus.",
        "Tone: Keep it grounded, vivid, and emotionally specific.",
        "End with a clear image or takeaway built for a short-form video.",
      ].join("\n"),
    tags: overrides.tags ?? [slug, "short-form", "video"],
    createdAt: overrides.createdAt ?? "2026-04-20T00:00:00.000Z",
  };
}

test("generatePrompts appends fully valid records with balanced categories", () => {
  const existing = [
    makeRecord({ category: "Daily Life", id: "2026-04-20-daily-life-001" }, 0),
    makeRecord({ category: "Daily Life", id: "2026-04-20-daily-life-002" }, 0),
    makeRecord({ category: "Technology", id: "2026-04-20-technology-001" }, 3),
    makeRecord({ category: "Technology", id: "2026-04-20-technology-002" }, 3),
    makeRecord({ category: "Motivation", id: "2026-04-20-motivation-001" }, 4),
  ];

  const generated = generatePrompts(existing, {
    count: 2,
    now: new Date("2026-04-21T12:00:00.000Z"),
  });

  assert.equal(generated.length, 2);
  validatePromptRecords([...existing, ...generated]);

  for (const record of generated) {
    assert.match(record.id, /^\d{4}-\d{2}-\d{2}-[a-z-]+-\d{3}$/);
    assert.equal(record.date, "2026-04-21");
    assert.ok(promptCategories.includes(record.category));
    assert.equal(record.prompt.trim().split("\n").length >= 3, true);
    assert.equal(record.prompt.trim().split("\n").length <= 5, true);
    assert.ok(record.tags.length >= 3);
  }

  const categories = generated.map((record) => record.category);
  assert.deepEqual(categories.sort(), ["Health", "Human Nature"].sort());
});

test("isDuplicateEntry catches near-duplicate titles or prompts", () => {
  const existing = [
    makeRecord({
      title: "Quiet Morning Reset",
      prompt: [
        "Hook: Start with a room that feels heavier than it looks.",
        "Visual: Curtains open, sheets smooth out, and one clean surface appears.",
        "Tone: Calm, hopeful, and quietly satisfying.",
        "Close on the feeling of mental space returning.",
      ].join("\n"),
    }, 0),
  ];

  const nearDuplicate = makeRecord({
    title: "Quiet Morning Resets",
    prompt: [
      "Hook: Start with a room that feels heavier than it looks.",
      "Visual: Curtains open, sheets smooth out, and one clear surface appears.",
      "Tone: Calm, hopeful, and quietly satisfying.",
      "Close on the feeling of mental space returning.",
    ].join("\n"),
  }, 0);

  const distinct = makeRecord({
    title: "Evening Walk to Clear Your Head",
    prompt: [
      "Hook: Open with the moment the workday finally lifts.",
      "Visual: Streetlights glow while footsteps slow into a calm neighborhood pace.",
      "Tone: Reflective, soft, and genuinely relieving.",
      "End on a small breath that feels earned.",
    ].join("\n"),
  }, 0);

  assert.equal(isDuplicateEntry(nearDuplicate, existing), true);
  assert.equal(isDuplicateEntry(distinct, existing), false);
});

test("main updates the dataset in place using the local schema", async () => {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "generate-video-prompts-"));
  const datasetPath = path.join(tempDir, "prompts.json");

  writeFileSync(
    datasetPath,
    JSON.stringify(
      [
        makeRecord({ id: "2026-04-20-daily-life-001" }, 0),
        makeRecord({ id: "2026-04-20-human-nature-001" }, 1),
      ],
      null,
      2,
    ),
  );

  try {
    await main(["--file", datasetPath, "--count", "2"], tempDir, new Date("2026-04-21T00:00:00.000Z"));

    const updated = validatePromptRecords(
      JSON.parse(readFileSync(datasetPath, "utf8")) as unknown,
    );

    assert.equal(updated.length, 4);
    assert.equal(
      updated.filter((record) => record.date === "2026-04-21").length,
      2,
    );
  } finally {
    rmSync(tempDir, { force: true, recursive: true });
  }
});
