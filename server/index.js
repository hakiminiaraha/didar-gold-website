import http from "node:http";

import { config } from "./config.js";
import { db } from "./db.js";
import { handleRequest } from "./app.js";

const server = http.createServer(handleRequest);

server.listen(config.port, config.host, () => {
  console.log(`[didar:api] listening on http://${config.host}:${config.port}`);
  if (!config.isProduction && config.otpProvider === "console") {
    console.log("[didar:api] development OTP provider active; code is 123456");
  }
});

// Graceful shutdown: stop accepting connections, drain in-flight requests, then
// close the database. The 10s hard cap can abort a legitimate in-flight upload
// (e.g. a 50 MB media POST) — this is intentional: a bounded shutdown is
// preferred over hanging indefinitely on a slow client.
function shutdown(signal) {
  console.log(`[didar:api] received ${signal}, shutting down`);
  server.close(async () => {
    try {
      await db.close();
    } finally {
      process.exit(0);
    }
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export { server };
