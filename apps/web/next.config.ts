import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const config: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: root,
  turbopack: { root },
  typedRoutes: true,
  // No generated agent-instruction files in this repo.
  agentRules: false,
  // postgres.js opens raw sockets; keep it a plain Node require on the server.
  serverExternalPackages: ["postgres"],
};

export default config;
