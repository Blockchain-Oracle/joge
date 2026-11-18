import { text, timestamp } from "drizzle-orm/pg-core";
import type { Network } from "./schema.ts";

/** Column shapes every table shares. */
export const network = () => text().$type<Network>().notNull();
export const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();
export const updatedAt = () =>
  timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
