import axios from "axios";

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const API_KEY = process.env.CRYPTORANK_API_KEY;
const API_BASE = process.env.CRYPTORANK_API_BASE || "https://api.cryptorank.io/v2";

if (!WEBHOOK) throw new Error("Missing DISCORD_WEBHOOK_URL");
if (!API_KEY) throw new Error("Missing CRYPTORANK_API_KEY");

const seen = new Set();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeRound(round) {
  const id =
    String(
      round.id ??
      round.uuid ??
      `${round.project?.name || round.name}-${round.announcedAt || round.date || round.createdAt}`
    );

  const project =
    round.project?.name ||
    round.currency?.name ||
    round.name ||
    "Unknown project";

  const amount =
    round.raised ??
    round.amount ??
    round.fundsRaised ??
    round.raise ??
    "N/A";

  const stage =
    round.stage?.name ||
    round.stage ||
    round.round ||
    "N/A";

  const date =
    round.announcedAt ||
    round.date ||
    round.createdAt ||
    "N/A";

  const investors = Array.isArray(round.investors)
    ? round.investors
        .map(i => i.name || i.title || i)
        .filter(Boolean)
        .slice(0, 8)
        .join(", ")
    : "N/A";

  const url =
    round.url ||
    round.project?.url ||
    "";

  return { id, project, amount, stage, date, investors, url };
}

async function fetchFundingRounds() {
  // Replace the endpoint path below with the exact funding-rounds list endpoint
  // shown in your CryptoRank V2 docs for your plan.
  const url = `${API_BASE}/funding-rounds`;

  const res = await axios.get(url, {
    headers: {
      "X-Api-Key": API_KEY
    },
    params: {
      limit: 20
    },
    timeout: 30000
  });

  const rows =
    res.data?.data ||
    res.data?.items ||
    res.data?.results ||
    [];

  return rows.map(normalizeRound);
}

async function sendToDiscord(r) {
  const content =
    `🚀 **New Raise**\n\n` +
    `**Project:** ${r.project}\n` +
    `**Amount:** ${r.amount}\n` +
    `**Stage:** ${r.stage}\n` +
    `**Investors:** ${r.investors}\n` +
    `**Date:** ${r.date}` +
    (r.url ? `\n${r.url}` : "");

  const res = await axios.post(WEBHOOK, { content }, { timeout: 30000 });
  console.log(`Discord status: ${res.status}`);
}

async function checkRounds() {
  console.log("Checking CryptoRank funding rounds...");
  const rounds = await fetchFundingRounds();

  for (const round of rounds) {
    if (seen.has(round.id)) continue;
    await sendToDiscord(round);
    seen.add(round.id);
    await sleep(1200);
  }

  console.log(`Done. Seen cache size: ${seen.size}`);
}

async function bootstrap() {
  try {
    // Prime cache on first run so it doesn't spam old rounds
    const initial = await fetchFundingRounds();
    for (const round of initial) seen.add(round.id);
    console.log(`Primed ${seen.size} existing rounds`);

    setInterval(async () => {
      try {
        await checkRounds();
      } catch (err) {
        console.error("Polling error:", err.response?.data || err.message);
      }
    }, 5 * 60 * 1000);

    console.log("Bot is running.");
  } catch (err) {
    console.error("Startup error:", err.response?.data || err.message);
    process.exit(1);
  }
}

bootstrap();
