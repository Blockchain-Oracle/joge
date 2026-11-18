"use client";

import { environmentManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/** Live data arrives over the stream (it updates the cache), so reads stay fresh without polling. */
const STALE_MS = 30_000;

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { staleTime: STALE_MS, refetchOnWindowFocus: true } } });
}

let browserQueryClient: QueryClient | undefined;

/** TanStack's App Router pattern: a fresh client per server request, one client for the browser's lifetime. */
function getQueryClient() {
  if (environmentManager.isServer()) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
