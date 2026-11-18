CREATE TABLE "faucet_claims" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"network" text NOT NULL,
	"address" text NOT NULL,
	"visitor" text NOT NULL,
	"state" text DEFAULT 'pending' NOT NULL,
	"satoshis" bigint,
	"txid" text,
	"hex" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "faucet_address" ON "faucet_claims" USING btree ("network","address","created_at");--> statement-breakpoint
CREATE INDEX "faucet_state" ON "faucet_claims" USING btree ("state");