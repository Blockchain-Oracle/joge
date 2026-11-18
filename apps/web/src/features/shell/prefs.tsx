"use client";

import { BellRing, Globe, Moon, Palette, Sun, SunMoon, Vibrate, Volume2 } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { feedbackPrefs, Segmented, Switch, setFeedbackPrefs } from "@/kit";
import { type PushState, usePush } from "../push/push.ts";
import { applyTheme, currentTheme, MAINNET_LIVE, type ThemeChoice } from "../theme/theme.ts";
import { setWorld, useWorld } from "./world.tsx";

const THEMES = [
  { value: "dark", label: <Moon size={14} aria-label="Night" /> },
  { value: "light", label: <Sun size={14} aria-label="Day" /> },
  { value: "system", label: <SunMoon size={14} aria-label="Match the device" /> },
] as const;

const WORLDS = [
  { value: "chipnet", label: "試 Test" },
  { value: "mainnet", label: "本番 Live" },
] as const;

/** One setting: an icon, a word, its control (Abu's rule: settings at rest are an icon and a value). */
export function SettingRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="text-[var(--muted)]">{icon}</span>
      <span className="flex-1 font-semibold text-[14px]">{label}</span>
      {children}
    </div>
  );
}

/** Why the alerts switch can't be used yet, in two or three words. */
const PUSH_BLOCKER: Partial<Record<PushState, string>> = {
  unsupported: "Not in this browser",
  install: "Add to Home Screen first",
  blocked: "Blocked in settings",
  "no-wallet": "Pair first",
};

/** Round alerts: your results and your agents' proposals, pushed even when Jōge is closed. */
function PushRow() {
  const push = usePush();
  const blocker = PUSH_BLOCKER[push.state];
  return (
    <SettingRow icon={<BellRing size={18} aria-hidden />} label="Alerts">
      {blocker ? (
        <span className="nx-num text-right text-[12px] text-[var(--muted)]">{blocker}</span>
      ) : (
        <Switch
          label="Round alerts"
          on={push.state === "on"}
          disabled={push.state === "busy"}
          onChange={() => void push.toggle()}
        />
      )}
    </SettingRow>
  );
}

/** Theme, network world, sound, haptics and alerts: the choices this browser keeps. */
export function Preferences() {
  const world = useWorld();
  const [theme, setTheme] = useState<ThemeChoice>("dark");
  const [sound, setSound] = useState(false);
  const [haptics, setHaptics] = useState(true);
  useEffect(() => {
    setTheme(currentTheme());
    setSound(feedbackPrefs().sound);
    setHaptics(feedbackPrefs().haptics);
  }, []);
  return (
    <>
      {MAINNET_LIVE ? (
        <SettingRow icon={<Globe size={18} aria-hidden />} label="World">
          <Segmented label="Network world" options={WORLDS} value={world} onChange={setWorld} size="sm" />
        </SettingRow>
      ) : null}
      <SettingRow icon={<Palette size={18} aria-hidden />} label="Theme">
        <Segmented
          label="Theme"
          options={THEMES}
          value={theme}
          size="sm"
          onChange={(next) => {
            setTheme(next);
            applyTheme(next);
          }}
        />
      </SettingRow>
      <SettingRow icon={<Volume2 size={18} aria-hidden />} label="Sound">
        <Switch
          label="Sound"
          on={sound}
          onChange={(on) => {
            setSound(on);
            setFeedbackPrefs({ sound: on });
          }}
        />
      </SettingRow>
      <PushRow />
      <SettingRow icon={<Vibrate size={18} aria-hidden />} label="Haptics">
        <Switch
          label="Haptics"
          on={haptics}
          onChange={(on) => {
            setHaptics(on);
            setFeedbackPrefs({ haptics: on });
          }}
        />
      </SettingRow>
    </>
  );
}
