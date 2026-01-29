import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/api/interpret", async (req, res) => {
  const prompt = req.body.prompt;

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

  const data = await r.json();
  res.json({ text: data.content[0].text });
});

app.listen(3001, () => console.log("Interpreter server on 3001"));
