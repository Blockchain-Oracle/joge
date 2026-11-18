import { ExternalLink } from "lucide-react";

/**
 * The BCH BLAZE banner every Mainnet Track entry carries at the top of its home page (F15): the Widget Factory deck,
 * the source repository, and the team's CashTokens address. Each item shows once its value is configured.
 */
const DECK = process.env.NEXT_PUBLIC_BLAZE_DECK_URL;
const REPO = process.env.NEXT_PUBLIC_REPO_URL;
const CASHTOKENS = process.env.NEXT_PUBLIC_CASHTOKENS_ADDRESS;

export function BlazeBanner() {
  if (!DECK && !REPO && !CASHTOKENS) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 bg-[var(--vermilion)] px-4 py-2 font-semibold text-[13px] text-white">
      <span className="nx-num tracking-[0.08em]">BCH BLAZE 2026</span>
      {DECK ? (
        <a
          href={DECK}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
        >
          Widget Factory deck <ExternalLink size={12} aria-hidden />
        </a>
      ) : null}
      {REPO ? (
        <a
          href={REPO}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
        >
          Source <ExternalLink size={12} aria-hidden />
        </a>
      ) : null}
      {CASHTOKENS ? <span className="nx-num break-all opacity-90">{CASHTOKENS}</span> : null}
    </div>
  );
}
