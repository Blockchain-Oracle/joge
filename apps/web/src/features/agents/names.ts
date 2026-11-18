/** Agents as characters: a face seed and a person's name to remember, both stable per seed. */
const FIRST = [
  "Kai",
  "Mara",
  "Yuki",
  "Rosa",
  "Theo",
  "Nadia",
  "Owen",
  "Lena",
  "Arun",
  "Mika",
  "Sana",
  "Ivy",
  "Rey",
  "Hana",
  "Milo",
  "Zara",
  "Finn",
  "Noor",
  "Elle",
  "Kenji",
];
const LAST = [
  "Ryder",
  "Vance",
  "Okafor",
  "Tanaka",
  "Mercer",
  "Sato",
  "Brooks",
  "Novak",
  "Reyes",
  "Holt",
  "Frost",
  "Kang",
  "Costa",
  "Wray",
  "Ito",
  "Nash",
  "Vega",
  "Lund",
  "Hale",
  "Mori",
];
const MULTIPLIER = 31;
const LAST_SHIFT = 5;
const SEED_RADIX = 36;
const SEED_LENGTH = 8;

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (Math.imul(h, MULTIPLIER) + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** A name for a face: "Mika Tanaka". */
export const codename = (seed: string) =>
  `${FIRST[hash(seed) % FIRST.length]} ${LAST[(hash(seed) >> LAST_SHIFT) % LAST.length]}`;

/** A fresh face seed for the studio's shuffle. */
export const newFaceSeed = () =>
  Math.random()
    .toString(SEED_RADIX)
    .slice(2, 2 + SEED_LENGTH);

/** The seed an agent's face is drawn from: the one its owner picked, else its key. */
export const faceOf = (agent: { avatarSeed?: string; agentPubkey: string; id: number }) =>
  agent.avatarSeed || agent.agentPubkey || `agent-${agent.id}`;
