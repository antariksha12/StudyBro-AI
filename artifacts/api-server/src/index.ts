import app from "./app";
import { logger } from "./lib/logger";

// Falls back to 8080 (matches the deployment's configured PORT in
// artifact.toml) so dev is robust even if PORT isn't set in the shell —
// mirrors the old server.js's `process.env.PORT || 5000` safety net.
const port = Number(process.env["PORT"]) || 8080;

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
