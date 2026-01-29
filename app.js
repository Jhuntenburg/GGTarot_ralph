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

function renderCards(cards) {
  const container = $("cards");
  container.innerHTML = "";

  for (const c of cards) {
    const wrap = document.createElement("div");
    wrap.className = "card";

    const img = document.createElement("img");
    img.src = `./${c.image_url}`;
    img.alt = c.name;

    const h = document.createElement("h3");
    h.textContent = c.name;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `Card #${c.id}`;

    const desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = c.description;

    wrap.appendChild(img);
    wrap.appendChild(h);
    wrap.appendChild(meta);
    wrap.appendChild(desc);

    container.appendChild(wrap);
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

  if (!Number.isFinite(count) || count < 1) {
    showError("Invalid reading size.");
    return;
  }

  if (!deck || deck.length < count) {
    showError("Deck not loaded or too small.");
    return;
  }

  const draw = shuffleCopy(deck).slice(0, count);

  // ✅ store last draw for interpretation step
  window.lastDraw = draw;

  $("questionOut").textContent = question || "(no question provided)";
  renderCards(draw);
  $("reading").style.display = "block";
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

async function interpretReading(cards, question) {
  const style = await fetch("./STYLE_GUIDE.md").then(r => r.text());

  const prompt = `
You are giving a tarot reading in the voice described below.

STYLE:
${style}

USER QUESTION:
${question || "General guidance"}

CARDS:
${cards.map(c => `${c.name}: ${c.description}`).join("\n\n")}

Give a cohesive reading that:
- Synthesizes the cards together
- Speaks directly to the seeker
- Uses the style rules
- Encourages reflection and empowerment
`;

  const res = await fetch("http://localhost:3001/interpret", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  return data.text;
}

document.getElementById("interpretBtn").addEventListener("click", async () => {
  const cards = [...document.querySelectorAll(".card")].map((_, i) => window.lastDraw[i]);
  const question = document.getElementById("question").value;
  document.getElementById("interpretation").textContent = "Interpreting...";

  const text = await interpretReading(window.lastDraw, question);
  document.getElementById("interpretation").textContent = text;
});
