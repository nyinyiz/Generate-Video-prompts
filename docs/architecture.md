# Architecture

## Overview

This project is a static-first web app for browsing and copying AI-ready short-video prompts. The architecture is intentionally simple:

- Next.js renders a single home page from a versioned local JSON dataset.
- A generator script appends new prompts to that dataset twice daily.
- GitHub Actions runs the generator on schedule and commits the updated data.

There is no runtime backend dependency, which keeps the app fast, cheap to host, and easy to maintain.

## Core Modules

### Web UI

- `app/page.tsx` renders the home page.
- `components/` contains focused presentation components.
- `lib/prompts.ts` normalizes dataset records for UI use, including the derived `today` vs `previous` split.

Responsibilities:

- Read static prompt data
- Filter by category
- Search by title, category, and tags
- Copy prompt text instantly

### Data Layer

- `data/prompts.json` stores the prompt archive.
- `types/prompt.ts` defines the canonical record type.
- `lib/schema.ts` validates prompt records and enforces the allowed categories plus the 3-5 line rule.

Responsibilities:

- Keep one strict source of truth for prompt records
- Make malformed or incomplete data fail fast
- Keep the UI and generator aligned on the same schema

### Prompt Generator

- `scripts/generate-prompts.ts` loads the dataset, generates new prompts, checks duplicates, and writes the updated JSON back to disk.

Responsibilities:

- Add 2 prompts by default per run
- Balance underrepresented categories first
- Generate template-based prompts with a hook, visual direction, and emotional tone
- Prevent near-duplicates using title and prompt similarity checks

### Automation

- `.github/workflows/update-prompts.yml` schedules the generator twice daily and commits updates when the dataset changes.

Responsibilities:

- Run at `00:00` UTC and `12:00` UTC
- Install dependencies
- Execute `npm run generate`
- Commit and push updated JSON

## Data Schema

Each prompt record uses:

```json
{
  "id": "YYYY-MM-DD-category-xxx",
  "date": "YYYY-MM-DD",
  "category": "Daily Life",
  "title": "string",
  "prompt": "3-5 lines",
  "tags": ["string"],
  "createdAt": "ISO timestamp"
}
```

Allowed categories:

- Daily Life
- Human Nature
- Health
- Technology
- Motivation
- Nature
- Society

## Folder Structure

```text
app/
components/
data/
lib/
scripts/
tests/
types/
.github/workflows/
docs/
```

## Design Decisions

- Static JSON was chosen over a database because the UI only needs read-only prompt browsing.
- The UI derives “Today” from the latest date present in the dataset, which makes the app resilient to static builds and historical viewing.
- Prompt generation stays deterministic and offline-friendly by using templates instead of external APIs.
- Validation lives in one shared schema module so the UI, tests, and generator all agree on the same contract.
