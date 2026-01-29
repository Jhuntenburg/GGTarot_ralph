import fs from "node:fs";

const sqlPath = "data/tarot_dump.sql";
const outPath = "data/cards.json";

const sql = fs.readFileSync(sqlPath, "utf8");

// Find the CARD insert start
const needle = "INSERT INTO `CARD`";
const start = sql.indexOf(needle);

if (start === -1) {
  console.error("Could not find: " + needle);
  process.exit(1);
}

// Find the VALUES keyword after INSERT INTO `CARD`
const valuesIdx = sql.indexOf("VALUES", start);
if (valuesIdx === -1) {
  console.error("Could not find VALUES after CARD insert.");
  process.exit(1);
}

// Scan forward until we hit the INSERT-terminating semicolon that is NOT inside a string
let i = valuesIdx;
let inString = false;
let escape = false;
let end = -1;

for (; i < sql.length; i++) {
  const ch = sql[i];

  if (escape) {
    escape = false;
    continue;
  }

  if (ch === "\\") {
    escape = true;
    continue;
  }

  if (ch === "'") {
    inString = !inString;
    continue;
  }

  if (ch === ";" && !inString) {
    end = i;
    break;
  }
}

if (end === -1) {
  console.error("Could not find end of CARD INSERT (semicolon outside strings).");
  process.exit(1);
}

// Extract just the VALUES blob (everything after VALUES up to the semicolon)
const stmt = sql.slice(valuesIdx, end);
const valuesPos = stmt.indexOf("VALUES");
const valuesBlob = stmt.slice(valuesPos + "VALUES".length).trim();

// valuesBlob looks like: (..),(..),(..)
const trimmed = valuesBlob.replace(/^[(]/, "").replace(/[)]$/, "");
const tuples = trimmed.split(/[)]\s*,\s*[(]/g);

function splitTuple(tupleText) {
  const fields = [];
  let cur = "";
  let inStr = false;
  let esc = false;

  for (let j = 0; j < tupleText.length; j++) {
    const c = tupleText[j];

    if (esc) {
      cur += c;
      esc = false;
      continue;
    }

    if (c === "\\") {
      cur += c;
      esc = true;
      continue;
    }

    if (c === "'") {
      inStr = !inStr;
      cur += c;
      continue;
    }

    if (c === "," && !inStr) {
      fields.push(cur.trim());
      cur = "";
      continue;
    }

    cur += c;
  }

  fields.push(cur.trim());
  return fields;
}

function unquote(v) {
  const s = v.trim();
  if (s.toUpperCase() === "NULL") return null;

  if (s.startsWith("'") && s.endsWith("'")) {
    return s
      .slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\");
  }

  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

const cards = [];

for (const t of tuples) {
  const fields = splitTuple(t);
  if (fields.length !== 4) continue;

  const id = Number(unquote(fields[0]));
  const name = unquote(fields[1]);
  const image_url = unquote(fields[2]);
  const description = unquote(fields[3]);

  if (!Number.isFinite(id) || !name || !image_url || !description) continue;

  cards.push({ id, name, image_url, description });
}

cards.sort((a, b) => a.id - b.id);

fs.writeFileSync(outPath, JSON.stringify({ table: "CARD", cards }, null, 2));
console.log(`Wrote ${outPath} with ${cards.length} tarot cards.`);
