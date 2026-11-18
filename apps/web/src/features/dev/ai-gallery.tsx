"use client";

import { Tag } from "@/kit";
import { LaneCubes } from "../agents/agent-card.tsx";
import { MODE_COPY, POSTURE_COPY } from "../agents/format.ts";
import { codename } from "../agents/names.ts";
import { Portrait } from "../agents/portrait.tsx";
import { SenseiMark } from "../sensei/orb.tsx";
import { openSensei } from "../sensei/store.ts";
import { SAMPLE_AGENT_LANES } from "./constants.ts";

const SAMPLE_FACES = ["sora", "kaze", "umi", "yama"];
const SAMPLE_SHARE = 0.62;

/** Sensei's mark and the agents' faces (the pages themselves read live data: /agents, the studio, Sensei). */
export function AiGallery() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="flex flex-col gap-4 rounded-[24px] bg-[var(--surface-1)] p-5">
        <Tag className="self-start">Sensei</Tag>
        <button type="button" onClick={() => openSensei()} className="flex items-center gap-3 self-start">
          <SenseiMark share={SAMPLE_SHARE} />
          <span className="nx-display text-[16px]">Opens the real panel</span>
        </button>
      </section>
      <section className="flex flex-col gap-4 rounded-[24px] bg-[var(--surface-1)] p-5">
        <Tag className="self-start">Agents</Tag>
        <div className="flex flex-wrap items-center gap-3">
          {SAMPLE_FACES.map((seed) => (
            <span key={seed} className="flex flex-col items-center gap-1">
              <Portrait seed={seed} name={codename(seed)} size={64} />
              <span className="nx-num text-[11px] text-[var(--muted)]">{codename(seed)}</span>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LaneCubes lanes={SAMPLE_AGENT_LANES} />
          <Tag>{MODE_COPY.ask.tag}</Tag>
          <Tag>{MODE_COPY.auto.tag}</Tag>
          <Tag>{POSTURE_COPY.balanced.label}</Tag>
        </div>
      </section>
    </div>
  );
}
