// Tiny local OTP catcher for Docker dev. The app runs in production mode (so it
// serves the SPA), which forbids the `console` OTP provider. Instead the app uses
// OTP_PROVIDER=http pointing here; this server receives the code so you can log in
// locally without a real SMS account.
//
// No dependencies — runs on a bare node image via bind mount.
//   POST /send  { mobile, code, template }  -> stores + logs the code, 200
//   GET  /              -> HTML page listing recent codes (auto-refreshes)
//   GET  /latest.json   -> most recent code as JSON
import http from "node:http";
import process from "node:process";

const PORT = Number(process.env.PORT || 8025);
const recent = []; // newest first, capped

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 1_000_000) req.destroy();
    });
    req.on("end", () => resolve(data));
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url.startsWith("/send")) {
    let payload = {};
    try {
      payload = JSON.parse((await readBody(req)) || "{}");
    } catch {
      /* ignore non-JSON */
    }
    const entry = { mobile: payload.mobile || "?", code: payload.code || "?", at: new Date().toISOString() };
    recent.unshift(entry);
    recent.length = Math.min(recent.length, 50);
    console.log(`[otp-catcher] ${entry.mobile} -> ${entry.code}`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/latest.json")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(recent[0] || null));
    return;
  }
  if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/?"))) {
    const rows = recent
      .map((e) => `<tr><td>${e.at}</td><td>${e.mobile}</td><td style="font-size:1.4em;font-weight:700">${e.code}</td></tr>`)
      .join("") || `<tr><td colspan="3">No codes yet — trigger a login.</td></tr>`;
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="3">
      <title>OTP catcher</title>
      <body style="font-family:system-ui;max-width:640px;margin:2rem auto">
      <h1>Didar OTP catcher</h1>
      <p>Latest OTP codes (newest first). Page refreshes every 3s.</p>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
      <tr><th>time</th><th>mobile</th><th>code</th></tr>${rows}</table></body>`);
    return;
  }
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not_found" }));
});

server.listen(PORT, "0.0.0.0", () => console.log(`[otp-catcher] listening on :${PORT}`));
