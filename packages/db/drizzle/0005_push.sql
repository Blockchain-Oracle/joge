CREATE TABLE "push_sent" (
	"endpoint" text NOT NULL,
	"item" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_sent_endpoint_item_pk" PRIMARY KEY("endpoint","item")
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"endpoint" text PRIMARY KEY NOT NULL,
	"network" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"pkhs" text[] NOT NULL,
	"since" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "push_network" ON "push_subscriptions" USING btree ("network");