import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Enable CORS for local development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST");
  next();
});

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

    // Build prompt from validated inputs
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).json({
        error: "Invalid request: prompt is required."
      });
    }

    // Call Anthropic API
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-latest",
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

app.listen(3001, () => console.log("Interpreter server on 3001"));
