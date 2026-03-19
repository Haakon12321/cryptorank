import axios from "axios";

const API_KEY = process.env.CRYPTORANK_API_KEY;
const API_BASE = "https://api.cryptorank.io/v2";

async function main() {
  if (!API_KEY) throw new Error("Missing CRYPTORANK_API_KEY");

  console.log("Testing CryptoRank funding rounds endpoint...");

  const res = await axios.get(`${API_BASE}/currencies/funding-rounds`, {
    headers: {
      "X-Api-Key": API_KEY
    },
    params: {
      limit: 5
    },
    timeout: 30000
  });

  console.log("Status:", res.status);
  console.log(JSON.stringify(res.data, null, 2).slice(0, 3000));
}

main().catch((err) => {
  console.error("FAILED");
  console.error("Status:", err.response?.status);
  console.error("Data:", err.response?.data || err.message);
  process.exit(1);
});
