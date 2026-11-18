CREATE TABLE "chain_cursors" (
	"network" text NOT NULL,
	"scripthash" text NOT NULL,
	"contract" text NOT NULL,
	"height" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chain_cursors_network_scripthash_pk" PRIMARY KEY("network","scripthash")
);
--> statement-breakpoint
CREATE TABLE "gates" (
	"network" text NOT NULL,
	"round_id" bigint NOT NULL,
	"gate_index" smallint NOT NULL,
	"contract" text NOT NULL,
	"stake_class" text NOT NULL,
	"entrants" integer NOT NULL,
	"totals" jsonb NOT NULL,
	"value" bigint NOT NULL,
	"outpoint" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gates_network_round_id_gate_index_pk" PRIMARY KEY("network","round_id","gate_index")
);
--> statement-breakpoint
CREATE TABLE "heartbeats" (
	"component" text PRIMARY KEY NOT NULL,
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keeper_jobs" (
	"network" text NOT NULL,
	"key" text NOT NULL,
	"kind" text NOT NULL,
	"round_id" bigint,
	"status" text NOT NULL,
	"txid" text,
	"error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"lease_until" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "keeper_jobs_network_key_pk" PRIMARY KEY("network","key")
);
--> statement-breakpoint
CREATE TABLE "lanes" (
	"network" text NOT NULL,
	"thread" smallint NOT NULL,
	"asset" text NOT NULL,
	"seconds" integer NOT NULL,
	"next_lock" integer NOT NULL,
	"counter" integer NOT NULL,
	"outpoint" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lanes_network_thread_pk" PRIMARY KEY("network","thread")
);
--> statement-breakpoint
CREATE TABLE "oracle_messages" (
	"feed" text NOT NULL,
	"message_sequence" integer NOT NULL,
	"data_sequence" integer NOT NULL,
	"timestamp" integer NOT NULL,
	"price" integer NOT NULL,
	"message" text NOT NULL,
	"signature" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "oracle_messages_feed_message_sequence_pk" PRIMARY KEY("feed","message_sequence")
);
--> statement-breakpoint
CREATE TABLE "price_ticks" (
	"asset" text NOT NULL,
	"at" timestamp (3) with time zone NOT NULL,
	"price" double precision NOT NULL,
	CONSTRAINT "price_ticks_asset_at_pk" PRIMARY KEY("asset","at")
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"network" text NOT NULL,
	"round_id" bigint NOT NULL,
	"thread" smallint NOT NULL,
	"lane_seconds" integer,
	"asset" text NOT NULL,
	"mode" text NOT NULL,
	"outcomes" smallint NOT NULL,
	"gates" smallint NOT NULL,
	"stake_class" text,
	"lock_time" integer NOT NULL,
	"close_time" integer NOT NULL,
	"creator_fee_bps" smallint NOT NULL,
	"creator_pkh" text NOT NULL,
	"min_pot" bigint NOT NULL,
	"min_entrants" integer NOT NULL,
	"boundaries" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"state" text NOT NULL,
	"void_reason" text,
	"entrants" integer DEFAULT 0 NOT NULL,
	"totals" jsonb NOT NULL,
	"pot" bigint DEFAULT 0 NOT NULL,
	"lock_sequence" integer,
	"xau_lock_sequence" integer,
	"strike_price" bigint,
	"close_price" bigint,
	"winner" smallint,
	"net_pot" bigint,
	"winner_total" bigint,
	"remaining" integer,
	"master_outpoint" text,
	"master_value" bigint,
	"open_txid" text NOT NULL,
	"lock_txid" text,
	"settle_txid" text,
	"final_txid" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rounds_network_round_id_pk" PRIMARY KEY("network","round_id")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"network" text NOT NULL,
	"outpoint" text NOT NULL,
	"round_id" bigint NOT NULL,
	"gate_index" smallint NOT NULL,
	"outcome" smallint NOT NULL,
	"stake" bigint NOT NULL,
	"payout_pkh" text NOT NULL,
	"value" bigint NOT NULL,
	"enter_txid" text NOT NULL,
	"status" text NOT NULL,
	"payout_txid" text,
	"payout_sats" bigint,
	"entered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_network_outpoint_pk" PRIMARY KEY("network","outpoint")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"network" text NOT NULL,
	"txid" text NOT NULL,
	"seq" bigserial NOT NULL,
	"kind" text NOT NULL,
	"round_id" bigint,
	"height" integer,
	"hex" text NOT NULL,
	"dropped" boolean DEFAULT false NOT NULL,
	"first_seen" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_network_txid_pk" PRIMARY KEY("network","txid")
);
--> statement-breakpoint
CREATE INDEX "keeper_jobs_round" ON "keeper_jobs" USING btree ("network","round_id");--> statement-breakpoint
CREATE INDEX "oracle_feed_time" ON "oracle_messages" USING btree ("feed","timestamp");--> statement-breakpoint
CREATE INDEX "oracle_feed_data" ON "oracle_messages" USING btree ("feed","data_sequence");--> statement-breakpoint
CREATE INDEX "rounds_state_lock" ON "rounds" USING btree ("network","state","lock_time");--> statement-breakpoint
CREATE INDEX "rounds_thread_lock" ON "rounds" USING btree ("network","thread","lock_time");--> statement-breakpoint
CREATE INDEX "tickets_round" ON "tickets" USING btree ("network","round_id");--> statement-breakpoint
CREATE INDEX "tickets_payout" ON "tickets" USING btree ("network","payout_pkh");--> statement-breakpoint
CREATE INDEX "transactions_round" ON "transactions" USING btree ("network","round_id");