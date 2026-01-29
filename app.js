let deck = null;

const $ = (id) => document.getElementById(id);

function showError(msg) {
  const el = $("error");
  el.textContent = msg;
  el.style.display = msg ? "block" : "none";
}

function shuffleCopy(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function loadDeck() {
  const res = await fetch("./data/cards.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load deck JSON (${res.status})`);
  const data = await res.json();
  if (!data?.cards?.length) throw new Error("Deck JSON is missing cards[]");
  return data.cards;
}

function renderCards(cards, spread) {
  const container = $("cards");
  container.innerHTML = "";

  // Define position labels for Past/Present/Future spread
  const positions = spread === "past-present-future" && cards.length === 3
    ? ["Past", "Present", "Future"]
    : [];

  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];

    // Create wrapper for position label + card
    const wrapper = document.createElement("div");
    wrapper.className = "card-wrapper";

    // Add position label if applicable
    if (positions.length > 0) {
      const label = document.createElement("div");
      label.className = "position-label";
      label.textContent = positions[i];
      wrapper.appendChild(label);
    }

    const wrap = document.createElement("div");
    wrap.className = "card";

    const inner = document.createElement("div");
    inner.className = "card-inner";

    // Front face (card back initially)
    const front = document.createElement("div");
    front.className = "card-face card-front";
    const backImg = document.createElement("img");
    backImg.src = "./images/cards/CardBack.png";
    backImg.alt = "Card back";
    front.appendChild(backImg);

    // Back face (actual card)
    const back = document.createElement("div");
    back.className = "card-face card-back";

    const img = document.createElement("img");
    img.src = `./${c.image_url}`;
    img.alt = c.name;

    // Apply 180deg rotation if reversed
    if (c.reversed) {
      img.style.transform = "rotate(180deg)";
    }

    const h = document.createElement("h3");
    h.textContent = c.name;

    // Add reversed indicator if applicable
    if (c.reversed) {
      const reversedLabel = document.createElement("span");
      reversedLabel.className = "reversed-label";
      reversedLabel.textContent = " (Reversed)";
      h.appendChild(reversedLabel);
    }

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `Card #${c.id}`;

    const desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = c.description;

    back.appendChild(img);
    back.appendChild(h);
    back.appendChild(meta);
    back.appendChild(desc);

    inner.appendChild(front);
    inner.appendChild(back);
    wrap.appendChild(inner);
    wrapper.appendChild(wrap);
    container.appendChild(wrapper);

    // Staggered flip animation
    setTimeout(() => {
      wrap.classList.add("flipped");
    }, i * 300 + 400);
  }
}

async function main() {
  const btn = $("drawBtn");
  btn.disabled = true;
  btn.textContent = "Loading deck...";

  try {
    deck = await loadDeck();
    btn.disabled = false;
    btn.textContent = "Draw cards";
  } catch (e) {
    showError(e?.message ?? String(e));
    btn.textContent = "Draw cards";
    return;
  }

  btn.addEventListener("click", () => {
  showError("");

  const question = $("question").value.trim();
  const count = Number($("count").value);
  const spread = $("spread").value;

  if (!Number.isFinite(count) || count < 1) {
    showError("Invalid reading size.");
    return;
  }

  if (!deck || deck.length < count) {
    showError("Deck not loaded or too small.");
    return;
  }

  const draw = shuffleCopy(deck).slice(0, count);

  // Mark some cards as reversed (20-30% probability)
  draw.forEach(card => {
    card.reversed = Math.random() < 0.25; // 25% chance
  });

  // ✅ store last draw for interpretation step
  window.lastDraw = draw;
  window.lastSpread = spread;

  $("questionOut").textContent = question || "(no question provided)";
  renderCards(draw, spread);
  $("reading").style.display = "block";
  $("interpretBtn").disabled = false;
});

  // btn.addEventListener("click", () => {
   
  //   showError("");

  //   const question = $("question").value.trim();
  //   const count = Number($("count").value);

  //   if (!Number.isFinite(count) || count < 1) {
  //     showError("Invalid reading size.");
  //     return;
  //   }

  //   if (!deck || deck.length < count) {
  //     showError("Deck not loaded or too small.");
  //     return;
  //   }

  //   const draw = shuffleCopy(deck).slice(0, count);


  //   $("questionOut").textContent = question || "(no question provided)";
  //   renderCards(draw);
  //   $("reading").style.display = "block";
  // });
}

main();

async function interpretReading(cards, question, spread) {
  const style = await fetch("./STYLE_GUIDE.md").then(r => r.text());

  // Define position labels for Past/Present/Future spread
  const positions = spread === "past-present-future" && cards.length === 3
    ? ["Past", "Present", "Future"]
    : [];

  const prompt = `
You are giving a tarot reading in the voice described below.

STYLE:
${style}

REVERSED CARD INTERPRETATION:
When a card is reversed, interpret it as the same theme turned inward, blocked, delayed, or in shadow. A reversed card is not "bad" - it shows an internalized or developing aspect of the card's energy. Keep your tone empowering and grounded.

USER QUESTION:
${question || "General guidance"}

CARDS:
${cards.map((c, i) => {
  let cardText = positions[i] ? `[${positions[i]}] ` : "";
  cardText += c.name;
  if (c.reversed) cardText += " (Reversed)";
  cardText += `: ${c.description}`;
  return cardText;
}).join("\n\n")}

Give a cohesive reading that:
- Synthesizes the cards together
- Speaks directly to the seeker
- Uses the style rules
- Addresses reversed cards with empowerment (blocked/internalized energy, not negative)
${positions.length > 0 ? "- Honors the spread positions in your interpretation" : ""}
- Encourages reflection and empowerment
`;

  const res = await fetch("http://localhost:3001/api/interpret", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  return data.text;
}

document.getElementById("interpretBtn").addEventListener("click", async () => {
  const question = document.getElementById("question").value;
  const spread = window.lastSpread || document.getElementById("spread").value;
  const interpretation = document.getElementById("interpretation");

  interpretation.textContent = "Interpreting...";
  interpretation.style.display = "block";

  try {
    const text = await interpretReading(window.lastDraw, question, spread);
    interpretation.textContent = text;
  } catch (err) {
    interpretation.textContent = `Error: ${err.message || "Failed to get reading. Is the server running?"}`;
  }
});
