CREATE TABLE "round_paths" (
	"network" text NOT NULL,
	"round_id" bigint NOT NULL,
	"points" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "round_paths_network_round_id_pk" PRIMARY KEY("network","round_id")
);
