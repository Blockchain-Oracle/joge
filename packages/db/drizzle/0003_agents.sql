CREATE TABLE "agent_reads" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"network" text NOT NULL,
	"agent_id" bigint NOT NULL,
	"round_id" bigint NOT NULL,
	"side" text,
	"confidence" double precision,
	"why" text,
	"model" text,
	"prompt_hash" text,
	"verdict" text NOT NULL,
	"reason" text,
	"stake" bigint,
	"txid" text,
	"proposal" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"network" text NOT NULL,
	"owner_pkh" text NOT NULL,
	"name" text NOT NULL,
	"persona" text NOT NULL,
	"posture" text NOT NULL,
	"lanes" jsonb NOT NULL,
	"per_bet_cap" bigint NOT NULL,
	"daily_cap" bigint NOT NULL,
	"mode" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"agent_pubkey" text NOT NULL,
	"vault_locking_bytecode" text NOT NULL,
	"vault_sats" bigint DEFAULT 0 NOT NULL,
	"copied_from" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "agent_reads_once" ON "agent_reads" USING btree ("agent_id","round_id");--> statement-breakpoint
CREATE INDEX "agent_reads_recent" ON "agent_reads" USING btree ("network","created_at");--> statement-breakpoint
CREATE INDEX "agents_owner" ON "agents" USING btree ("network","owner_pkh");