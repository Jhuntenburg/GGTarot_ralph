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

    // Back face (revealed card with secondary flip for image/description)
    const back = document.createElement("div");
    back.className = "card-face card-back";

    // Secondary flip container
    const cardContent = document.createElement("div");
    cardContent.className = "card-content";

    // Image face (default view after first flip)
    const imageFace = document.createElement("div");
    imageFace.className = "card-image-face";

    const img = document.createElement("img");
    img.src = `./${c.image_url}`;
    img.alt = c.name;
    if (c.reversed) {
      img.style.transform = "rotate(180deg)";
    }

    const h = document.createElement("h3");
    h.textContent = c.name;
    if (c.reversed) {
      const reversedLabel = document.createElement("span");
      reversedLabel.className = "reversed-label";
      reversedLabel.textContent = " (Reversed)";
      h.appendChild(reversedLabel);
    }

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `Card #${c.id}`;

    imageFace.appendChild(img);
    imageFace.appendChild(h);
    imageFace.appendChild(meta);

    // Description face (shown after second flip)
    const descFace = document.createElement("div");
    descFace.className = "card-desc-face";

    const descH = document.createElement("h3");
    descH.textContent = c.name;
    if (c.reversed) {
      const reversedLabel2 = document.createElement("span");
      reversedLabel2.className = "reversed-label";
      reversedLabel2.textContent = " (Reversed)";
      descH.appendChild(reversedLabel2);
    }

    const descScroll = document.createElement("div");
    descScroll.className = "desc-scroll";
    const desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = c.description;
    descScroll.appendChild(desc);

    descFace.appendChild(descH);
    descFace.appendChild(descScroll);

    cardContent.appendChild(imageFace);
    cardContent.appendChild(descFace);

    // Flip hint button
    const flipHint = document.createElement("div");
    flipHint.className = "flip-hint";
    flipHint.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
      </svg>
      <span class="flip-hint-text">View Description</span>
    `;

    // Click handler to toggle between image and description
    flipHint.addEventListener("click", (e) => {
      e.stopPropagation();
      const isShowingDesc = wrap.classList.toggle("show-description");
      flipHint.querySelector(".flip-hint-text").textContent = 
        isShowingDesc ? "View Image" : "View Description";
    });

    back.appendChild(cardContent);
    back.appendChild(flipHint);

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
  // Send card data to backend - prompt building happens server-side
  const res = await fetch("/api/interpret", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cards,
      question,
      spread
    })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to get reading");
  }

  const data = await res.json();
  return data.reading;
}

function formatReading(text, spread, cards) {
  // If spread has positions (Past/Present/Future), try to structure the reading
  if (spread === "past-present-future" && cards.length === 3) {
    const positions = ["Past", "Present", "Future"];

    // Split by double newlines (paragraphs)
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

    // If we have roughly one paragraph per card position, add section headers
    if (paragraphs.length >= 3) {
      let formatted = "";

      for (let i = 0; i < Math.min(3, paragraphs.length); i++) {
        formatted += `<div class="card-section">`;
        formatted += `<div class="card-section-title">${positions[i]}: ${cards[i].name}${cards[i].reversed ? " (Reversed)" : ""}</div>`;
        formatted += `<p>${paragraphs[i].trim()}</p>`;
        formatted += `</div>`;
      }

      // Add remaining paragraphs as synthesis/conclusion
      if (paragraphs.length > 3) {
        formatted += `<div class="card-section">`;
        formatted += `<div class="card-section-title">Synthesis</div>`;
        for (let i = 3; i < paragraphs.length; i++) {
          formatted += `<p>${paragraphs[i].trim()}</p>`;
        }
        formatted += `</div>`;
      }

      return formatted;
    }
  }

  // Default: simple paragraph formatting
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  return paragraphs.map(p => `<p>${p.trim()}</p>`).join("");
}

document.getElementById("interpretBtn").addEventListener("click", async () => {
  const question = document.getElementById("question").value;
  const spread = window.lastSpread || document.getElementById("spread").value;
  const interpretation = document.getElementById("interpretation");
  const interpretBtn = document.getElementById("interpretBtn");
  const drawBtn = document.getElementById("drawBtn");

  // Disable buttons during request to prevent double-submits
  interpretBtn.disabled = true;
  drawBtn.disabled = true;

  // Show loading state
  interpretation.className = "interpretation-loading";
  interpretation.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Interpreting your reading...</p>
  `;
  interpretation.style.display = "block";

  try {
    const text = await interpretReading(window.lastDraw, question, spread);

    // Display successful reading with formatted structure
    interpretation.className = "interpretation-success";
    interpretation.innerHTML = formatReading(text, spread, window.lastDraw);

    // Re-enable buttons after success
    interpretBtn.disabled = false;
    drawBtn.disabled = false;
  } catch (err) {
    // Show friendly error message with retry button
    interpretation.className = "interpretation-error";
    interpretation.innerHTML = `
      <div class="error-icon">⚠</div>
      <p class="error-message">Unable to generate reading. ${err.message || "Please check that the server is running."}</p>
      <button class="retry-btn" id="retryBtn">Try Again</button>
    `;

    // Re-enable draw button so user can continue
    drawBtn.disabled = false;

    // Add retry button handler
    document.getElementById("retryBtn").addEventListener("click", () => {
      document.getElementById("interpretBtn").click();
    });
  }
});
