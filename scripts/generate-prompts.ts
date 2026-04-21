#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import {
  promptCategories,
  validatePromptRecords,
  type PromptCategory,
  type PromptRecord,
} from "../lib/schema";

const DEFAULT_COUNT = 2;
const TITLE_DUPLICATE_THRESHOLD = 0.76;
const PROMPT_DUPLICATE_THRESHOLD = 0.82;
const MAX_ATTEMPTS_PER_PROMPT = 24;

type GeneratorOptions = {
  count?: number;
  now?: Date;
};

type PromptTemplate = {
  titles: string[];
  visuals: string[];
  emotionalTones: string[];
  closes: string[];
  tags: string[];
};

const promptTemplates: Record<PromptCategory, PromptTemplate> = {
  "Daily Life": {
    titles: [
      "The Five-Minute Kitchen Reset",
      "Leaving the House Without the Rush",
      "A Desk That Lets You Breathe",
      "Tiny Rituals That Calm a Busy Morning",
      "Making Laundry Feel Like a Win",
    ],
    visuals: [
      "show tactile close-ups of hands clearing, folding, wiping, and resetting one small space",
      "track a simple routine through natural light, clean surfaces, and one satisfying final frame",
      "move from clutter to clarity with readable cuts and a steady lived-in pace",
      "keep the camera intimate with everyday objects, quiet gestures, and visible progress",
    ],
    emotionalTones: [
      "calm, grounding, and quietly satisfying",
      "warm, practical, and reassuring",
      "clean, steady, and emotionally relieving",
      "cozy, human, and low-pressure",
    ],
    closes: [
      "End on a frame that makes ordinary order feel like self-respect.",
      "Finish with one simple habit viewers can copy today.",
      "Let the final beat land as relief, not perfection.",
      "Close with a before-and-after contrast that feels earned.",
    ],
    tags: ["routine", "home", "lifestyle", "short-form"],
  },
  "Human Nature": {
    titles: [
      "Why Small Kindness Hits So Hard",
      "The Story We Tell Ourselves First",
      "Why We Avoid the Tiny Tasks",
      "How Memory Keeps the Feeling, Not the Facts",
      "Why Private Praise Feels Different",
    ],
    visuals: [
      "cut between ordinary gestures, facial reactions, and small pauses that reveal the inner shift",
      "use reflective surfaces, notebooks, text messages, and close-ups that make the psychology feel personal",
      "anchor abstract ideas in familiar micro-moments people instantly recognize",
      "pair observational details with restrained movement so the emotion leads the sequence",
    ],
    emotionalTones: [
      "thoughtful, intimate, and emotionally honest",
      "curious, relatable, and quietly revealing",
      "reflective, human, and gently challenging",
      "warm, observant, and psychologically sharp",
    ],
    closes: [
      "End with one line that makes the viewer reconsider their own pattern.",
      "Close on a small expression that carries the whole insight.",
      "Finish with a question that stays with the viewer after the scroll.",
      "Let the last beat feel personal instead of preachy.",
    ],
    tags: ["psychology", "behavior", "reflection", "mindset"],
  },
  Health: {
    titles: [
      "Water Before the World Wakes Up",
      "The Two-Minute Walk That Resets a Day",
      "Stretching Between Meetings",
      "Sleep Starts Before the Pillow",
      "A Tiny Habit for Better Energy",
    ],
    visuals: [
      "show simple movement, natural light, and practical habits in clean everyday environments",
      "keep the demo concrete with body language changing as the habit takes effect",
      "focus on clear, copyable actions rather than abstract wellness imagery",
      "use gentle pacing, uncluttered spaces, and visible relief in posture or mood",
    ],
    emotionalTones: [
      "fresh, practical, and reassuring",
      "supportive, calm, and genuinely useful",
      "restorative, clear, and quietly motivating",
      "grounded, healthy, and easy to trust",
    ],
    closes: [
      "Close with one action simple enough to try immediately.",
      "Finish on a physical cue that shows the benefit without overexplaining it.",
      "End with a calm reminder that better health can start small.",
      "Let the last shot feel like relief, not pressure.",
    ],
    tags: ["wellness", "habit", "energy", "health"],
  },
  Technology: {
    titles: [
      "The Assistant Already in Your Pocket",
      "From Voice Note to Action Plan",
      "When the App Learns Your Rhythm",
      "A Cleaner Digital Workspace in Seconds",
      "Let the Boring Task Disappear",
    ],
    visuals: [
      "use crisp screen-driven storytelling with real tasks becoming easier in a few fast beats",
      "show phones, laptops, and hands moving through a believable workflow instead of a concept demo",
      "keep the interface readable with quick cuts, progress states, and one obvious payoff",
      "pair tech moments with real-life context so the usefulness feels immediate",
    ],
    emotionalTones: [
      "smart, modern, and practical",
      "energetic, clean, and genuinely helpful",
      "efficient, polished, and forward-looking",
      "futuristic without losing everyday realism",
    ],
    closes: [
      "End on the specific time or effort this tool gives back.",
      "Finish with a payoff that feels useful, not flashy.",
      "Close on a smoother workflow viewers can picture using tomorrow.",
      "Let the final frame show technology serving a real human need.",
    ],
    tags: ["ai", "productivity", "tools", "technology"],
  },
  Motivation: {
    titles: [
      "Five Minutes Still Counts",
      "Do It Before You Feel Ready",
      "One Hard Thing a Day",
      "Finish the Ugly Draft",
      "Momentum Starts Smaller Than You Think",
    ],
    visuals: [
      "show the first imperfect action, not the polished result, with clear physical movement",
      "build tension through countdowns, first reps, first words, or the first click of publish",
      "keep the sequence active and readable so progress feels possible right now",
      "use grounded scenes of work, training, or creative effort without turning it into a montage cliché",
    ],
    emotionalTones: [
      "direct, energizing, and credible",
      "steady, uplifting, and action-oriented",
      "honest, determined, and emotionally clean",
      "firm, hopeful, and momentum-building",
    ],
    closes: [
      "End with a line that makes starting feel smaller than waiting.",
      "Finish on the idea that consistency beats intensity.",
      "Close with visible progress, even if it is tiny.",
      "Let the final beat feel earned rather than inspirational for its own sake.",
    ],
    tags: ["motivation", "discipline", "action", "growth"],
  },
  Nature: {
    titles: [
      "Rain Writing on the Window",
      "Morning Light on Water",
      "Wind Through an Open Field",
      "Clouds Moving Faster Than the Day",
      "The Forest Right After Rain",
    ],
    visuals: [
      "lean into texture, ambient movement, and natural sound with slow deliberate camera motion",
      "show small environmental details before opening up to scale and atmosphere",
      "use macro moments, soft focus shifts, and wide reveals to create immersion",
      "let the environment carry the story with minimal text and patient framing",
    ],
    emotionalTones: [
      "reflective, immersive, and soothing",
      "calm, spacious, and quietly awe-filled",
      "soft, atmospheric, and emotionally restorative",
      "serene, tactile, and deeply present",
    ],
    closes: [
      "End on a final image that invites the viewer to breathe slower.",
      "Finish with one lingering environmental sound or motion cue.",
      "Close on stillness that feels earned after the movement.",
      "Let the last frame hold just long enough to become a mood.",
    ],
    tags: ["nature", "ambient", "cinematic", "outdoors"],
  },
  Society: {
    titles: [
      "The Price of Always Being Busy",
      "Who Gets the Quiet Spaces",
      "The Invisible Work Holding Everything Up",
      "How a City Sounds When You Really Listen",
      "What Public Space Teaches Us About Care",
    ],
    visuals: [
      "contrast motion and stillness across streets, transit, public spaces, and everyday labor",
      "show people in shared environments with rhythmic cuts that reveal systems, not just scenes",
      "use observational footage that keeps individuals human while widening the social lens",
      "anchor the point in recognizable civic life so the theme feels immediate and lived-in",
    ],
    emotionalTones: [
      "thoughtful, humane, and quietly urgent",
      "observant, social, and emotionally grounded",
      "respectful, reflective, and community-minded",
      "clear-eyed, compassionate, and provocative",
    ],
    closes: [
      "End on one image that turns the social point into a human feeling.",
      "Finish with a question that makes the viewer re-enter their own surroundings differently.",
      "Close on a pause that gives the idea room to land.",
      "Let the final beat connect systems back to ordinary people.",
    ],
    tags: ["society", "culture", "community", "observation"],
  },
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  return normalizeText(value).replace(/\s+/g, "-");
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function countLines(value: string) {
  return value
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0).length;
}

function tokenSet(value: string) {
  return new Set(normalizeText(value).split(" ").filter(Boolean));
}

function jaccardSimilarity(left: Set<string>, right: Set<string>) {
  if (left.size === 0 && right.size === 0) {
    return 1;
  }

  let shared = 0;
  for (const token of left) {
    if (right.has(token)) {
      shared += 1;
    }
  }

  const union = left.size + right.size - shared;
  return union === 0 ? 0 : shared / union;
}

function textSimilarity(left: string, right: string) {
  const normalizedLeft = normalizeText(left);
  const normalizedRight = normalizeText(right);

  if (!normalizedLeft || !normalizedRight) {
    return 0;
  }

  if (normalizedLeft === normalizedRight) {
    return 1;
  }

  return jaccardSimilarity(tokenSet(left), tokenSet(right));
}

function parseArgs(argv: string[]) {
  const args: { datasetPath?: string; count?: number } = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--file" || token === "--dataset") {
      args.datasetPath = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === "--count" || token === "-n") {
      const value = Number(argv[index + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid count value: ${argv[index + 1]}`);
      }
      args.count = Math.floor(value);
      index += 1;
    }
  }

  return args;
}

function buildPromptText(category: PromptCategory, variantIndex: number) {
  const template = promptTemplates[category];
  const title = template.titles[variantIndex % template.titles.length];
  const visual = template.visuals[variantIndex % template.visuals.length];
  const tone = template.emotionalTones[variantIndex % template.emotionalTones.length];
  const close = template.closes[variantIndex % template.closes.length];

  return {
    title,
    prompt: [
      `Hook: ${title}.`,
      `Visual: ${visual}.`,
      `Tone: ${tone}.`,
      close,
    ].join("\n"),
    tags: template.tags,
  };
}

function nextSequence(records: PromptRecord[], date: string, category: PromptCategory) {
  const categorySlug = slugify(category);
  const matchingRecords = records.filter(
    (record) => record.date === date && record.category === category,
  );

  return String(matchingRecords.length + 1).padStart(3, "0").replace(/^/, `${date}-${categorySlug}-`);
}

function categoryCounts(records: PromptRecord[]) {
  return promptCategories.map((category) => ({
    category,
    count: records.filter((record) => record.category === category).length,
  }));
}

function selectCategory(records: PromptRecord[]) {
  return categoryCounts(records).sort((left, right) => {
    if (left.count !== right.count) {
      return left.count - right.count;
    }
    return promptCategories.indexOf(left.category) - promptCategories.indexOf(right.category);
  })[0]?.category ?? promptCategories[0];
}

function createPromptRecord(
  records: PromptRecord[],
  category: PromptCategory,
  now: Date,
  variantIndex: number,
): PromptRecord {
  const date = toDateString(now);
  const { title, prompt, tags } = buildPromptText(category, variantIndex);

  return {
    id: nextSequence(records, date, category),
    date,
    category,
    title,
    prompt,
    tags,
    createdAt: now.toISOString(),
  };
}

export function isDuplicateEntry(candidate: PromptRecord, existingEntries: PromptRecord[]) {
  return existingEntries.some((entry) => {
    const titleScore = textSimilarity(candidate.title, entry.title);
    const promptScore = textSimilarity(candidate.prompt, entry.prompt);

    return (
      titleScore >= TITLE_DUPLICATE_THRESHOLD ||
      promptScore >= PROMPT_DUPLICATE_THRESHOLD
    );
  });
}

export function generatePrompts(
  existingEntries: PromptRecord[],
  options: GeneratorOptions = {},
) {
  const count = options.count ?? DEFAULT_COUNT;
  const now = options.now ?? new Date();
  const generated: PromptRecord[] = [];

  for (let index = 0; index < count; index += 1) {
    const records = [...existingEntries, ...generated];
    const category = selectCategory(records);
    let candidate: PromptRecord | null = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_PROMPT; attempt += 1) {
      const nextCandidate = createPromptRecord(records, category, now, records.length + attempt);

      if (countLines(nextCandidate.prompt) < 3 || countLines(nextCandidate.prompt) > 5) {
        continue;
      }

      if (isDuplicateEntry(nextCandidate, records)) {
        continue;
      }

      candidate = nextCandidate;
      break;
    }

    if (!candidate) {
      throw new Error(`Unable to generate a unique prompt for ${category}.`);
    }

    generated.push(candidate);
  }

  return generated;
}

export async function loadDataset(datasetPath: string) {
  const raw = JSON.parse(await readFile(datasetPath, "utf8")) as unknown;
  return validatePromptRecords(raw);
}

async function saveDataset(datasetPath: string, prompts: PromptRecord[]) {
  await writeFile(datasetPath, `${JSON.stringify(prompts, null, 2)}\n`, "utf8");
}

export async function main(
  argv = process.argv.slice(2),
  cwd = process.cwd(),
  now = new Date(),
) {
  const { datasetPath, count } = parseArgs(argv);
  const resolvedDatasetPath = path.resolve(cwd, datasetPath ?? "data/prompts.json");
  const existingEntries = await loadDataset(resolvedDatasetPath);
  const additions = generatePrompts(existingEntries, {
    count,
    now,
  });
  const updatedEntries = validatePromptRecords([...existingEntries, ...additions]);

  await saveDataset(resolvedDatasetPath, updatedEntries);
  process.stdout.write(
    `Added ${additions.length} prompt${additions.length === 1 ? "" : "s"} to ${resolvedDatasetPath}\n`,
  );

  return { additions, updatedEntries, datasetPath: resolvedDatasetPath };
}

const isEntrypoint =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isEntrypoint) {
  main().catch((error) => {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
