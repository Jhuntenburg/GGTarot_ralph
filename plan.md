# Genius Garden Tarot - Plan

## Overview
Build a tarot reading app using Jessi Huntenburg’s deck and interpretation style.

---

## Tasks

[[
  {
    "category": "ux",
    "description": "Improve layout styling and spacing",
    "steps": [
      "Make layout feel more like a tarot app (soft background, elegant spacing, better typography)",
      "Incorporate visual motif from images/cards/CardBack.png (e.g., header mark / subtle pattern / border styling) suitable for marketing/brand consistency",
      "Use a color palette that feels drawn from the card artwork (warm neutrals + accents). Do not hardcode exact colors from a single card; choose a cohesive palette that matches the deck vibe",
      "Add card flipping animation using images/cards/CardBack.png as the back face",
      "Ensure cards display cleanly on mobile (no horizontal scroll, readable text, images scale nicely)"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Add Past/Present/Future spread option",
    "steps": [
      "Add spread selector UI with at least: 'Simple' (no positions) and 'Past / Present / Future'",
      "When spread is Past/Present/Future and count is 3, map cards to positions in that order",
      "Display position labels above each card"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Add reversed card logic",
    "steps": [
      "Randomly mark ~20-30% of drawn cards as reversed",
      "Show a clear reversed indicator in UI (e.g., 'Reversed' label) and visually rotate the card image 180deg when reversed",
      "Include reversed state in the interpretation input so the AI can reference it"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Improve interpretation prompt structure",
    "steps": [
      "Pass spread positions into prompt (if present)",
      "Pass reversed state into prompt for each card",
      "Add explicit instruction for reversed interpretation: treat as blocked/internalized/shadow expression of the upright theme; remain empowering and non-fatalistic",
      "Ensure readings feel cohesive and Jessi-style (STYLE_GUIDE.md rules)"
    ],
    "passes": true
  }
]
