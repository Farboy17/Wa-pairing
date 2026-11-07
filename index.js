import express from "express";
import pino from "pino";
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers,
} from "@whiskeysockets/baileys";

const app = express();
app.use(express.json());

const SECRET = process.env.PAIR_SECRET;
const DIR = process.env.SESSIONS_DIR || "./sessions";
const logger = pino({ level: "silent" });
const sockets = new Map(); // number -> socket

async function startBot(number, { wantCode = false } = {}) {
  const { state, saveCreds } = await useMultiFileAuthState(`${DIR}/${number}`);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version, logger, auth: state,
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Chrome"),
  });
  sockets.set(number, sock);
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") console.log(`[${number}] imeunganishwa`);
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      sockets.delete(number);
      if (reason !== DisconnectReason.loggedOut) startBot(number); // reconnect
      else console.log(`[${number}] ameondoa kifaa (logged out)`);
    }
  });

  // === Mantiki ya bot yako hapa ===
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m?.message || m.key.fromMe) return;
    const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
    if (text.trim().toLowerCase() === "ping") {
      await sock.sendMessage(m.key.remoteJid, { text: "pong 🏓" });
    }
  });

  if (wantCode && !state.creds.registered) {
    await new Promise((r) => setTimeout(r, 3000)); // subiri socket iwe tayari
    return sock.requestPairingCode(number);
  }
}

app.post("/pair", async (req, res) => {
  if (!SECRET || req.headers["x-pair-secret"] !== SECRET)
    return res.status(401).json({ error: "Hairuhusiwi." });

  const number = String(req.body.number || "").replace(/\D/g, "");
  if (number.length < 10 || number.length > 15)
    return res.status(400).json({ error: "Namba si sahihi." });

  try {
    if (sockets.has(number))
      return res.status(409).json({ error: "Namba hii tayari imeunganishwa au inaunganishwa." });
    const code = await startBot(number, { wantCode: true });
    if (!code) return res.status(409).json({ error: "Namba hii tayari imesajiliwa." });
    res.json({ code });
  } catch (e) {
    console.error(e);
    sockets.delete(number);
    res.status(500).json({ error: "Imeshindikana kutengeneza code." });
  }
});

app.get("/", (_, res) => res.send("ok"));
app.listen(process.env.PORT || 3000, () => console.log("Server inaendesha"));
