import axios from "axios";

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const API_KEY = process.env.CRYPTORANK_API_KEY;
const API_BASE = process.env.CRYPTORANK_API_BASE || "https://api.cryptorank.io/v2";

async function main() {
  if (!WEBHOOK) throw new Error("Missing DISCORD_WEBHOOK_URL");
  if (!API_KEY) throw new Error("Missing CRYPTORANK_API_KEY");

  console.log("Testing CryptoRank API...");

  const res = await axios.get(`${API_BASE}/funding-rounds`, {
    headers: {
      "X-Api-Key": API_KEY
    },
    params: {
      limit: 5
    },
    timeout: 30000
  });

  console.log("CryptoRank status:", res.status);
  console.log("Response keys:", Object.keys(res.data || {}));

  await axios.post(WEBHOOK, {
    content: "CryptoRank API test worked ✅"
  });

  console.log("Discord message sent.");
}

main().catch((err) => {
  console.error("TEST FAILED");
  console.error("Status:", err.response?.status);
  console.error("Data:", err.response?.data || err.message);
  process.exit(1);
});
