# Genius Garden Tarot

A tarot reading app using Jessi Huntenburg's Genius Garden Tarot deck and interpretation style. Draw cards, ask questions, and receive empowering, soul-centered readings powered by AI.

## Features

- **Interactive Card Drawing**: Draw 1-5 cards with animated card flipping
- **Multiple Spreads**: Choose between Simple or Past/Present/Future spreads
- **Reversed Card Logic**: Cards may appear reversed with shadow/internalized interpretations
- **AI-Powered Readings**: Get cohesive, Jessi-style interpretations via Claude API
- **Mock Mode**: Practice and develop locally without spending API tokens
- **Responsive Design**: Works beautifully on mobile and desktop

## Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- An Anthropic API key (only required for real AI readings)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ralph-lab
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your configuration:
```env
# Required only for real AI readings
ANTHROPIC_API_KEY=your_api_key_here

# Choose mode: 'mock' or 'claude'
INTERPRETER_MODE=mock
```

## Running the Application

### Backend Server

Start the Node.js backend server:

```bash
npm start
```

The backend server will run on `http://localhost:3000` by default.

### Frontend UI

In a separate terminal, serve the frontend files:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open your browser to: **http://127.0.0.1:8000**

## Environment Variables

### `ANTHROPIC_API_KEY`

Your Anthropic API key for accessing Claude AI. Get one from: https://console.anthropic.com/

**Required when**: `INTERPRETER_MODE=claude`
**Not required when**: `INTERPRETER_MODE=mock`

### `INTERPRETER_MODE`

Controls which interpretation engine to use:

- **`mock`** (recommended for development): Returns deterministic, pre-generated readings without calling the API. Perfect for local development, testing UI changes, and avoiding API costs.

- **`claude`**: Calls the Anthropic Claude API for real AI-powered readings. Requires a valid `ANTHROPIC_API_KEY`.

**Default**: `mock`

## Mock Mode

Mock mode allows you to develop and test the application without spending API tokens. It generates deterministic readings based on:

- The selected spread type (Simple vs Past/Present/Future)
- The cards drawn (including reversed state)
- The question asked

Mock readings follow the same Jessi-style voice and structure as real readings, so the UI behavior is identical between modes.

### Enabling Mock Mode

Set in your `.env` file:
```env
INTERPRETER_MODE=mock
```

No API key is required in mock mode.

## Real AI Readings

To use real AI-powered readings:

1. Get an API key from https://console.anthropic.com/
2. Set it in your `.env` file:
```env
ANTHROPIC_API_KEY=sk-ant-...
INTERPRETER_MODE=claude
```

3. Restart the backend server

**Note**: Each reading consumes API tokens. See Anthropic's pricing for current rates.

## How to Use

1. **Ask a Question** (optional): Enter your question in the text field
2. **Choose a Spread**: Select "Simple" or "Past / Present / Future"
3. **Set Card Count**: Choose how many cards to draw (1-5)
4. **Draw Cards**: Click "Draw Cards" to reveal your spread
5. **Get Reading**: Click "Get Reading" to receive an interpretation

## Cost Control & Safety

The app includes built-in guardrails:

- **Max Tokens**: Readings are limited to 600 tokens to control costs
- **Question Length Validation**: Questions over 500 characters are rejected
- **Minimal Logging**: Server logs only metadata (spread type, card count, question length)
- **Disclaimer**: A reflective guidance notice appears with each reading

## Project Structure

```
ralph-lab/
├── index.html          # Frontend UI
├── app.js              # Frontend JavaScript (card drawing, UI logic)
├── server.js           # Backend API (Node.js + Express)
├── data/               # Card data (JSON)
│   ├── cards.json      # All card definitions and descriptions
│   └── spreads.json    # Spread configurations
├── images/
│   └── cards/          # Card images (CardBack.png, individual cards)
├── STYLE_GUIDE.md      # Jessi Huntenburg interpretation style guide
├── .env.example        # Example environment configuration
└── package.json        # Node.js dependencies
```

## Deck Credit

This app uses the **Genius Garden Tarot** deck by Jessi Huntenburg.
Learn more: [https://www.jessihuntenburg.com/geniusgarden](https://www.jessihuntenburg.com/geniusgarden)

## Development

### Starting Both Servers

For local development, you need both servers running:

**Terminal 1 - Backend:**
```bash
npm start
```

**Terminal 2 - Frontend:**
```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

### Using Different Ports

If port 8000 is busy, try incrementing:
```bash
python3 -m http.server 8001 --bind 127.0.0.1
python3 -m http.server 8002 --bind 127.0.0.1
# etc.
```

## Interpretation Style

Readings follow Jessi Huntenburg's signature style:

- **Warm, grounded, compassionate** tone
- **Empowering, never fatalistic** approach
- Encourages **inner wisdom** and **sovereignty**
- Treats cards as **mirrors for reflection**, not fate
- Focuses on **integration and embodiment** over prediction

See `STYLE_GUIDE.md` for complete interpretation guidelines.

## License

ISC
