import axios from "axios";

const WEBHOOK = "PASTE_YOUR_WEBHOOK_URL";

async function send() {
  await axios.post(WEBHOOK, {
    content: "Bot is live 🚀"
  });
}

send();
