CREATE TABLE "lane_demand" (
	"network" text NOT NULL,
	"thread" smallint NOT NULL,
	"until" timestamp with time zone NOT NULL,
	CONSTRAINT "lane_demand_network_thread_pk" PRIMARY KEY("network","thread")
);
