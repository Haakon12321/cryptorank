import axios from "axios";
import * as cheerio from "cheerio";

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

let seen = new Set();

async function fetchRaises() {
  const res = await axios.get("https://cryptorank.io/funding-rounds");
  const $ = cheerio.load(res.data);

  let raises = [];

  $(".funding-rounds-table tbody tr").each((i, el) => {
    const project = $(el).find("td").eq(1).text().trim();
    const amount = $(el).find("td").eq(2).text().trim();
    const stage = $(el).find("td").eq(3).text().trim();
    const date = $(el).find("td").eq(0).text().trim();

    const id = project + amount + date;

    raises.push({ id, project, amount, stage, date });
  });

  return raises;
}

async function send(r) {
  const msg =
    `🚀 New Raise\n\n` +
    `Project: ${r.project}\n` +
    `Amount: ${r.amount}\n` +
    `Stage: ${r.stage}\n` +
    `Date: ${r.date}`;

  await axios.post(WEBHOOK, { content: msg });
}

async function run() {
  console.log("Checking raises...");

  const raises = await fetchRaises();

  for (const r of raises) {
    if (seen.has(r.id)) continue;

    await send(r);
    seen.add(r.id);
  }
}

setInterval(run, 5 * 60 * 1000);
run();
