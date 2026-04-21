# Generate Video Prompts

A production-ready starter for a daily AI video prompt generator built with Next.js, TypeScript, Tailwind CSS, a local JSON dataset, and a scheduled prompt-generation workflow.

## Features

- Static Next.js home page with fast JSON-backed loading
- "Today's prompts" and "Previous prompts" sections
- Search by title, category, or tags
- Instant copy-to-clipboard feedback
- Local JSON datastore with a strict prompt schema
- Template-based prompt generator with duplicate prevention
- GitHub Actions automation that updates prompts twice daily

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Local JSON dataset in `data/prompts.json`
- Node-based generator script in `scripts/generate-prompts.ts`
- GitHub Actions for scheduling

## Project Structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  category-filter.tsx
  copy-button.tsx
  header.tsx
  prompt-card.tsx
data/
  prompts.json
lib/
  prompts.ts
  schema.ts
scripts/
  generate-prompts.ts
tests/
  generate-prompts.test.ts
  prompts.test.ts
types/
  prompt.ts
.github/workflows/
  update-prompts.yml
docs/
  architecture.md
```

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run generate
```

## Data Model

Each prompt record uses this shape:

```json
{
  "id": "YYYY-MM-DD-category-xxx",
  "date": "YYYY-MM-DD",
  "category": "Daily Life",
  "title": "string",
  "prompt": "3-5 lines of video-ready text",
  "tags": ["string"],
  "createdAt": "ISO timestamp"
}
```

Approved categories:

- Daily Life
- Human Nature
- Health
- Technology
- Motivation
- Nature
- Society

## Prompt Generation

`npm run generate` appends `2` new prompts by default to `data/prompts.json`.

Generation rules:

- 3-5 lines per prompt
- Includes a hook, visual direction, and emotional tone
- Built for short-form videos under 60 seconds
- Balances underrepresented categories first
- Rejects near-duplicates by title and prompt similarity

You can also specify a count manually:

```bash
npm run generate -- --count 4
```

## Automation

The repository includes `.github/workflows/update-prompts.yml`, which:

- Runs at `00:00` UTC
- Runs at `12:00` UTC
- Installs dependencies
- Runs `npm run generate`
- Commits updated JSON back to `main` when changes exist

If you need local-time scheduling instead of UTC, adjust the cron values in the workflow.

## Notes

- The UI is fully usable without a backend.
- The dataset is versioned in git for transparency and easy review.
- The current setup is static-first, but the schema and modules are small enough to migrate to a database later if needed.
