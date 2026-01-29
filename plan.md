# Genius Garden Tarot - Plan

## Overview
Build a tarot reading app using Jessi Huntenburg’s deck and interpretation style.

---

## Tasks
```json
[
{
"category": "feature",
"description": "Add 'Get Reading' button and wire it to AI endpoint",
"steps": [
"Add a visible 'Get Reading' button below the question input (disabled until a draw exists)",
"On click, POST to /api/interpret with: question, spread, cards[] (id, name, reversed, position label if any)",
"Render the returned text into a 'Reading' panel on the page"
],
"passes": true
},
{
"category": "backend",
"description": "Create /api/interpret endpoint (Claude) with safe config",
"steps": [
"Implement an express server route POST /api/interpret",
"Read ANTHROPIC_API_KEY from environment (do not store in repo)",
"Call Anthropic/Claude API and return plain text JSON { reading: string }",
"Add basic validation (must include cards, count 1-5 only)",
"Return helpful errors (400 validation, 500 upstream failure) without leaking secrets"
],
"passes": true
},
{
"category": "prompt",
"description": "Create prompt builder for Jessi-style cohesive readings",
"steps": [
"Create a single function that builds the Claude prompt from inputs",
"Include: question, spread name, each card (name, reversed, position, description excerpt optional)",
"Add explicit Jessi-style instruction from STYLE_GUIDE.md",
"Add reversed rules: inward/blocked/delayed/shadow—never fatalistic",
"Add output format constraints (short sections + practical takeaway)"
],
"passes": true
},
{
"category": "ux",
"description": "Add interpretation UI states (loading, error, retry)",
"steps": [
"Show loading state while AI is generating reading",
"Disable buttons during request to avoid double-submits",
"Show friendly error message on failure with a retry button",
"Keep previously drawn cards visible even if interpretation fails"
],
"passes": true
},
{
"category": "ux",
"description": "Improve reading output formatting for readability",
"steps": [
"Render reading with comfortable line spacing and section headers",
"Add subtle separators or card-position headings when spread has positions",
"Ensure mobile readability (font size, line length, spacing)"
],
"passes": true
},
{
"category": "ux",
"description": "Add cost-control + safety guardrails",
"steps": [
"Add max tokens / sensible limits server-side",
'Add a short "This is reflective guidance" disclaimer below reading',
"Block extremely long questions and return validation error",
"Log only minimal metadata server-side (no full prompts or keys)"
],
"passes": true
},
{
"category": "testing",
"description": "Add a mock mode for local dev without spending tokens",
"steps": [
"Add env flag (e.g., INTERPRETER_MODE=mock|claude)",
"If mock, return a deterministic fake reading based on cards/spread",
"Confirm UI behaves the same in mock and real mode"
],
"passes": false
},
{
"category": "docs",
"description": "Document how to run locally (server + UI + env vars)",
"steps": [
"Update README with setup steps",
"Include required env vars and how to run",
"Include how to enable mock mode"
],
"passes": false
}
]