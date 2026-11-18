/** The agent runner's pacing. */
const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;
/** How often the runner looks for rounds to read (a round change also wakes it). */
export const AGENT_TICK_MS = 15 * SECOND_MS;
/** Never read a round this close to its lock: the entry still has to land. */
export const AGENT_READ_LEAD_SECONDS = 60;
/** Read only after a quarter of the entry window has passed, so the pot says something. */
export const AGENT_READ_AFTER_SHARE = 0.75;
/** The price line the agent sees: this window, thinned to this many points. */
export const AGENT_PRINTS_WINDOW_MS = 15 * MINUTE_MS;
export const AGENT_PRINTS = 12;
/** Reads the gate looks back over (streaks, today's spend) and the ones the prompt shows. */
export const MEMORY_FOR_GATE = 60;
export const MEMORY_FOR_PROMPT = 5;
/** The smallest change a vault bet may leave (below it the change output would be dust and nodes refuse it). */
export const VAULT_CHANGE_MIN = 546n;
/** How much of a failed entry's error the memory keeps. */
export const REASON_MAX = 160;
