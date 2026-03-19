import axios from "axios";

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

let sent = new Set();

async function fetchRaises() {
  // temporary fake data (we replace this next step)
  return [
    {
      id: "1",
      project: "Example Protocol",
      amount: "$10M",
      stage: "Seed",
      investors: "a16z"
    }
  ];
}

async function sendToDiscord(r) {
  const content =
    `🚀 New Raise\n\n` +
    `Project: ${r.project}\n` +
    `Amount: ${r.amount}\n` +
    `Stage: ${r.stage}\n` +
    `Investors: ${r.investors}`;

  await axios.post(WEBHOOK, { content });
}

async function run() {
  console.log("Checking for new raises...");

  const raises = await fetchRaises();

  for (const r of raises) {
    if (sent.has(r.id)) continue;

    await sendToDiscord(r);
    sent.add(r.id);
  }
}

setInterval(run, 5 * 60 * 1000); // every 5 min
run();
