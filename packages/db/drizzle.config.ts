import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/schema.ts", "./src/schema-ops.ts"],
  out: "./drizzle",
  casing: "snake_case",
});
