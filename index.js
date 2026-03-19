import axios from "axios";

const WEBHOOK = "https://discord.com/api/webhooks/1484097341102227529/UDIhySx9KMIE5IkTSJKFeFwQ_qD2g-Jyn_r9cThSDZrK-mopyPJidDTWZXJAga75Z-X3";

async function send() {
  await axios.post(WEBHOOK, {
    content: "Bot is live 🚀"
  });
}

send();
