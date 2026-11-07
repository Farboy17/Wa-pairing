# WhatsApp Pairing Site

Muundo: `web/` (Vercel) -> `server/` (Railway/Render/VPS) -> WhatsApp.

## 1. Server (Railway/Render/VPS)
1. Weka folder `server/` kwenye repo (GitHub), deploy kwenye Railway/Render.
2. Env: `PAIR_SECRET`, `SESSIONS_DIR`. Ongeza persistent volume (mfano /data) na weka `SESSIONS_DIR=/data/sessions`, la sivyo sessions zitafutika kila redeploy.
3. Nakili URL ya server.

## 2. Web (Vercel)
1. Weka folder `web/` kwenye repo, import Vercel (Root Directory = web).
2. Env: `BOT_SERVER_URL`, `PAIR_SECRET` (ile ile ya server).
3. Deploy.

## Majaribio
Tuma "ping" kwa namba iliyounganishwa kutoka namba nyingine; bot inajibu "pong".

## Tahadhari
- Baileys ni library isiyo rasmi; matumizi ya wingi au spam yanaweza kusababisha namba kufungiwa na WhatsApp.
- Folder ya sessions ina funguo za akaunti za watumiaji. Ilinde, usiiweke Git.
- Kwa rate limit imara zaidi, tumia Upstash Ratelimit badala ya Map ya ndani.
