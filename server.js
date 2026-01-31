import 'dotenv/config';
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { readFileSync } from "fs";

const app = express();

// Load style guide once at startup
const STYLE_GUIDE = readFileSync("./STYLE_GUIDE.md", "utf-8");

// Get interpreter mode from environment (default to 'claude')
const INTERPRETER_MODE = process.env.INTERPRETER_MODE || 'claude';

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

/**
 * Generate a deterministic mock reading for development without spending API tokens
 * @param {Array} cards - Array of card objects
 * @param {string} question - User's question
 * @param {string} spread - Spread type
 * @returns {string} Mock reading text
 */
function generateMockReading(cards, question, spread) {
  const positions = spread === "past-present-future" && cards.length === 3
    ? ["Past", "Present", "Future"]
    : [];

  let reading = "";

  if (positions.length > 0) {
    // Structured reading for Past/Present/Future spread
    cards.forEach((card, i) => {
      const reversedText = card.reversed ? " (in shadow)" : "";
      reading += `**${positions[i]}: ${card.name}${reversedText}**\n\n`;

      if (i === 0) {
        reading += `This card speaks to the foundations you've been building${card.reversed ? ", though perhaps in ways you haven't fully acknowledged yet" : ""}. `;
      } else if (i === 1) {
        reading += `Right now, you're being invited to ${card.reversed ? "look inward at what's not yet ready to emerge" : "engage fully with what's present"}. `;
      } else {
        reading += `Moving forward, the energy of ${card.name}${card.reversed ? " asks you to work through internal blocks first" : " lights the path ahead"}. `;
      }
      reading += "\n\n";
    });

    reading += `**Synthesis**\n\nBeauty, these cards together weave a story of transformation. ${question ? "Your question holds its own wisdom—" : ""}trust what you already know. What feels true in your body as you read this?`;
  } else {
    // Simple reading
    reading += "The cards before you mirror something essential.\n\n";

    const cardNames = cards.map(c => {
      const reversed = c.reversed ? " in shadow" : "";
      return `${c.name}${reversed}`;
    }).join(", ");

    reading += `You've drawn ${cardNames}. `;

    if (cards.some(c => c.reversed)) {
      reading += "Notice how the reversed cards aren't obstacles, but invitations to look inward. ";
    }

    reading += `What wants to be integrated here? ${question ? "Your question already contains part of the answer—" : ""}trust the pull of your own Genius.\n\n`;
    reading += "What small, grounded step feels aligned right now?";
  }

  return reading;
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

// Serve static files from current directory
app.use(express.static('.'));

app.post("/api/interpret", async (req, res) => {
  console.log("[/api/interpret] Request received");
  try {
    // Validate request body
    const { cards, question, spread } = req.body;
    console.log("[/api/interpret] Cards:", cards?.length, "Spread:", spread);

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

    // Log only minimal metadata (no full prompts or keys)
    console.log(`[API Request] mode=${INTERPRETER_MODE}, spread=${spread}, cards=${cards.length}, question_length=${question?.length || 0}`);

    // Handle mock mode
    if (INTERPRETER_MODE === 'mock') {
      console.log('[Mock Mode] Generating deterministic reading');
      const mockReading = generateMockReading(cards, question, spread);
      return res.json({ reading: mockReading });
    }

    // Claude mode - check API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: "Server configuration error. Please contact the administrator."
      });
    }

    // Build prompt using the buildPrompt function
    const prompt = buildPrompt(cards, question, spread);
    console.log("[/api/interpret] Calling Anthropic API...");

    // Call Anthropic API
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }]
      })
    });

    // Handle upstream API errors
    if (!r.ok) {
      const errorBody = await r.text();
      console.error("Anthropic API error:", r.status, r.statusText, errorBody);
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

const PORT = process.env.PORT || 8009;
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  console.log(`Interpreter mode: ${INTERPRETER_MODE}`);
  console.log(`API key loaded: ${process.env.ANTHROPIC_API_KEY ? 'Yes (starts with ' + process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...)' : 'NO - CHECK YOUR .env FILE'}`);
});
