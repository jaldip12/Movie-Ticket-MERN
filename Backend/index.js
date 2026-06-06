// Must come first — populates process.env before any other module that reads it.
import "dotenv/config";

import { createServer } from "node:http";
import { app } from "./app.js";
import connectDB from "./src/db/index.js";
import { startLockCleanup } from "./src/utils/lockCleanup.js";
import { attachRealtime } from "./src/utils/realtime.js";

const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET", "CLIENT_URL"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const PORT = process.env.PORT || 8000;

const server = createServer(app);
attachRealtime(server);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`⚙️  Server running on port ${PORT}`);
      startLockCleanup();
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
