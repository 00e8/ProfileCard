import { useEffect, useState } from 'react';

// Optional remote counter (https://counterapi.dev). If VITE_COUNTER_WORKSPACE
// isn't set, the counter falls back to a local-only tally for this browser
// only — it will still work, but won't share a total across visitors.
const WORKSPACE = import.meta.env.VITE_COUNTER_WORKSPACE as string | undefined;
const COUNTER_NAME = (import.meta.env.VITE_COUNTER_NAME as string | undefined) || 'page-views';
const TOKEN = import.meta.env.VITE_COUNTER_TOKEN as string | undefined;

const VISITED_KEY = 'hyzex-has-visited';
const CACHED_COUNT_KEY = 'hyzex-view-count';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractCount = (json: any): number | null => {
  const candidates = [
    json?.data?.up_count,
    json?.data?.value,
    json?.data?.count,
    json?.data?.total,
    json?.value,
    json?.count,
    typeof json?.data === 'number' ? json.data : undefined,
  ];
  const value = candidates.find((v) => typeof v === 'number');
  return typeof value === 'number' ? value : null;
};

/**
 * Tracks a "unique views" counter. Each browser only ever counts as one
 * visit (tracked via localStorage) — reopening or refreshing the site
 * from the same browser fetches the current total without incrementing
 * it again.
 */
export const useViewCounter = () => {
  const [count, setCount] = useState<number | null>(() => {
    const cached = localStorage.getItem(CACHED_COUNT_KEY);
    return cached ? Number(cached) : null;
  });

  useEffect(() => {
    let cancelled = false;
    const alreadyVisited = localStorage.getItem(VISITED_KEY) === '1';

    const persist = (value: number) => {
      if (cancelled) return;
      setCount(value);
      localStorage.setItem(CACHED_COUNT_KEY, String(value));
    };

    if (!WORKSPACE) {
      console.warn(
        'View counter: VITE_COUNTER_WORKSPACE is not set — using a local-only tally for this browser.'
      );
      if (!alreadyVisited) {
        const next = (Number(localStorage.getItem(CACHED_COUNT_KEY)) || 0) + 1;
        localStorage.setItem(VISITED_KEY, '1');
        persist(next);
      }
      return;
    }

    const base = `https://api.counterapi.dev/v2/${WORKSPACE}/${COUNTER_NAME}`;
    const headers: Record<string, string> = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
    const url = alreadyVisited ? base : `${base}/up`;

    const run = async () => {
      try {
        const res = await fetch(url, { headers });
        const text = await res.text();

        // Mark this browser as visited as soon as we get *any* response
        // from the /up call — even if parsing the count fails below, we
        // don't want to call /up again on the next load and inflate it.
        if (!alreadyVisited) localStorage.setItem(VISITED_KEY, '1');

        let json: unknown = null;
        try {
          json = text ? JSON.parse(text) : null;
        } catch {
          console.error('View counter: response was not valid JSON:', text);
          return;
        }

        if (!res.ok) {
          console.error(`View counter: request failed (HTTP ${res.status})`, json ?? text);
          return;
        }

        const value = extractCount(json);
        if (value !== null) {
          persist(value);
        } else {
          console.error('View counter: could not find a count in the response:', json);
        }
      } catch (error) {
        // Network-level failure (offline, DNS, or blocked by CORS before
        // a response was even received).
        console.error('View counter: request could not be sent (network/CORS?):', error);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return count;
};
