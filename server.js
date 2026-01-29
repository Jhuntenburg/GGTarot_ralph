import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { readFileSync } from "fs";

const app = express();

// Load style guide once at startup
const STYLE_GUIDE = readFileSync("./STYLE_GUIDE.md", "utf-8");

/**
 * Build a cohesive prompt for Jessi-style tarot readings
 * @param {Array} cards - Array of card objects with {name, description, reversed, position}
 * @param {string} question - User's question or empty for general guidance
 * @param {string} spread - Spread type (e.g., "simple" or "past-present-future")
 * @returns {string} Complete prompt for Claude API
 */
function buildPrompt(cards, question, spread) {
  // Define position labels for Past/Present/Future spread
  const positions = spread === "past-present-future" && cards.length === 3
    ? ["Past", "Present", "Future"]
    : [];

  const cardsText = cards.map((c, i) => {
    let cardText = positions[i] ? `[${positions[i]}] ` : "";
    cardText += c.name;
    if (c.reversed) cardText += " (Reversed)";
    if (c.description) cardText += `: ${c.description}`;
    return cardText;
  }).join("\n\n");

  return `You are giving a tarot reading in the voice described below.

STYLE:
${STYLE_GUIDE}

REVERSED CARD INTERPRETATION:
When a card is reversed, interpret it as the same theme turned inward, blocked, delayed, or in shadow. A reversed card is not "bad" - it shows an internalized or developing aspect of the card's energy. Keep your tone empowering and grounded.

USER QUESTION:
${question || "General guidance"}

CARDS:
${cardsText}

Give a cohesive reading that:
- Synthesizes the cards together into a unified narrative
- Speaks directly to the seeker with warmth and compassion
- Uses the style rules above (warm, grounded, empowering)
- Addresses reversed cards with empowerment (blocked/internalized energy, not negative)
${positions.length > 0 ? "- Honors the spread positions (Past/Present/Future) in your interpretation" : ""}
- Encourages reflection and empowerment
- Ends with a practical takeaway or grounding question for the seeker

FORMAT:
Keep sections short and readable. Use 2-3 short paragraphs maximum.`;
}

// Manual CORS middleware (must be first)
app.use((req, res, next) => {
  console.log(`[CORS] ${req.method} ${req.path}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS immediately
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Handling OPTIONS request');
    return res.status(204).end();
  }

  next();
});

app.use(express.json());

app.post("/api/interpret", async (req, res) => {
  try {
    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: "Server configuration error. Please contact the administrator."
      });
    }

    // Validate request body
    const { cards, question, spread } = req.body;

    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({
        error: "Invalid request: cards array is required."
      });
    }

    if (cards.length < 1 || cards.length > 5) {
      return res.status(400).json({
        error: "Invalid request: must include between 1 and 5 cards."
      });
    }

    // Block extremely long questions (cost control + safety)
    if (question && question.length > 500) {
      return res.status(400).json({
        error: "Question is too long. Please keep it under 500 characters."
      });
    }

    // Build prompt using the buildPrompt function
    const prompt = buildPrompt(cards, question, spread);

    // Log only minimal metadata (no full prompts or keys)
    console.log(`[API Request] spread=${spread}, cards=${cards.length}, question_length=${question?.length || 0}`);

    // Call Anthropic API
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }]
      })
    });

    // Handle upstream API errors
    if (!r.ok) {
      console.error("Anthropic API error:", r.status, r.statusText);
      return res.status(500).json({
        error: "Failed to generate reading. Please try again later."
      });
    }

    const data = await r.json();

    // Check for valid response structure
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error("Unexpected API response structure");
      return res.status(500).json({
        error: "Failed to generate reading. Please try again later."
      });
    }

    // Return reading in expected format
    res.json({ reading: data.content[0].text });

  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({
      error: "An unexpected error occurred. Please try again later."
    });
  }
});

app.listen(3002, () => console.log("Interpreter server on 3002"));
