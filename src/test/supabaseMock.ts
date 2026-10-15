import { vi } from "vitest";

type Result = { data?: unknown; error?: unknown };
export type DbCall = { table: string; op: "insert" | "update"; payload: unknown };

/**
 * Chainable Supabase query-builder mock.
 * Results are keyed by "<table>:<op>" where op is select | insert | update.
 * Every chain method returns the builder; `.single()` and `await builder` resolve the result.
 */
export function createDbMock(results: Record<string, Result> = {}) {
  const calls: DbCall[] = [];

  const from = vi.fn((table: string) => {
    let op: "select" | "insert" | "update" = "select";
    const resolve = () => {
      const r = results[`${table}:${op}`] ?? {};
      return { data: r.data ?? null, error: r.error ?? null };
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builder: any = {};
    for (const m of ["select", "eq", "lt", "is", "order", "limit"]) {
      builder[m] = vi.fn(() => builder);
    }
    builder.insert = vi.fn((payload: unknown) => {
      op = "insert";
      calls.push({ table, op, payload });
      return builder;
    });
    builder.update = vi.fn((payload: unknown) => {
      op = "update";
      calls.push({ table, op, payload });
      return builder;
    });
    builder.single = vi.fn(() => Promise.resolve(resolve()));
    builder.then = (ok: (v: unknown) => unknown, fail: (e: unknown) => unknown) =>
      Promise.resolve(resolve()).then(ok, fail);
    return builder;
  });

  return {
    db: { from },
    calls,
    callsFor: (table: string, op: DbCall["op"]) =>
      calls.filter((c) => c.table === table && c.op === op),
  };
}

export function jsonRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
