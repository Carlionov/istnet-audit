import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOWED_IDS = new Set(["us", "fi", "nl", "tr"]);
type NodeStatus = "online" | "offline" | "unknown";
type StatusNode = { id: string; status: NodeStatus; latencyMs: number | null };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}

/**
 * Upstream contract:
 * {
 *   "nodes": [
 *     { "id": "nl", "status": "online", "latencyMs": 42 },
 *     { "id": "tr", "status": "offline", "latencyMs": null }
 *   ],
 *   "updatedAt": "2026-10-30T12:30:00.000Z"
 * }
 */
export async function GET() {
  const endpoint = process.env.MISTNET_STATUS_ENDPOINT;
  if (!endpoint) {
    return json(
      {
        state: "unconfigured",
        message: "Set MISTNET_STATUS_ENDPOINT to enable live monitoring.",
        nodes: [],
      },
      503,
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(endpoint);
    if (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost") {
      return json({ state: "error", message: "Status endpoint must use HTTPS." }, 500);
    }
  } catch {
    return json({ state: "error", message: "Invalid status endpoint URL." }, 500);
  }

  try {
    const headers = new Headers({ Accept: "application/json" });
    const token = process.env.MISTNET_STATUS_TOKEN;
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const upstream = await fetch(parsedUrl, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(6500),
    });

    if (!upstream.ok) {
      return json({ state: "error", message: `Monitoring upstream returned ${upstream.status}.` }, 502);
    }

    const payload: unknown = await upstream.json();
    if (!payload || typeof payload !== "object" || !Array.isArray((payload as { nodes?: unknown }).nodes)) {
      return json({ state: "error", message: "Invalid monitoring payload: nodes[] is required." }, 502);
    }

    const rawNodes = (payload as { nodes: unknown[] }).nodes;
    const nodes: StatusNode[] = rawNodes.flatMap((entry): StatusNode[] => {
      if (!entry || typeof entry !== "object") return [];
      const item = entry as { id?: unknown; status?: unknown; latencyMs?: unknown };
      if (typeof item.id !== "string" || !ALLOWED_IDS.has(item.id)) return [];
      const status: NodeStatus = item.status === "online" || item.status === "offline" ? item.status : "unknown";
      const latencyMs = typeof item.latencyMs === "number" && Number.isFinite(item.latencyMs) && item.latencyMs > 0 && item.latencyMs <= 10000
        ? Math.round(item.latencyMs)
        : null;
      return [{ id: item.id, status, latencyMs }];
    });

    const updatedAtRaw = (payload as { updatedAt?: unknown }).updatedAt;
    const updatedAt = typeof updatedAtRaw === "string" && !Number.isNaN(Date.parse(updatedAtRaw))
      ? new Date(updatedAtRaw).toISOString()
      : null;

    return json({ state: "configured", updatedAt, nodes });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? "Monitoring upstream timed out."
      : "Unable to reach monitoring upstream.";
    return json({ state: "error", message }, 502);
  }
}
