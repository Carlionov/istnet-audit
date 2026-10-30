import type {
  ServerNodeId,
  ServerNodeStatus,
  ServerStatusNode,
  ServerStatusResponse,
} from "@/lib/runtime/contracts";

const SERVER_NODE_IDS = new Set<ServerNodeId>(["us", "fi", "nl", "tr"]);
const SERVER_NODE_STATUSES = new Set<ServerNodeStatus>([
  "online",
  "offline",
  "unknown",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseNode(value: unknown): ServerStatusNode | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !SERVER_NODE_IDS.has(value.id as ServerNodeId)) {
    return null;
  }
  if (typeof value.status !== "string" || !SERVER_NODE_STATUSES.has(value.status as ServerNodeStatus)) {
    return null;
  }
  if (
    value.latencyMs !== null &&
    (typeof value.latencyMs !== "number" ||
      !Number.isFinite(value.latencyMs) ||
      value.latencyMs <= 0)
  ) {
    return null;
  }

  return {
    id: value.id as ServerNodeId,
    status: value.status as ServerNodeStatus,
    latencyMs: value.latencyMs,
  };
}

/** Validates the API boundary before untrusted JSON enters React state. */
export function parseServerStatusResponse(value: unknown): ServerStatusResponse | null {
  if (!isRecord(value) || typeof value.state !== "string") return null;

  if (value.state === "unconfigured") {
    return {
      state: "unconfigured",
      ...(typeof value.message === "string" ? { message: value.message } : {}),
      ...(Array.isArray(value.nodes) ? { nodes: [] } : {}),
    };
  }

  if (value.state === "error") {
    if (typeof value.message !== "string") return null;
    return { state: "error", message: value.message };
  }

  if (value.state !== "configured" || !Array.isArray(value.nodes)) return null;

  const nodes = value.nodes.map(parseNode);
  if (nodes.some((node) => node === null)) return null;

  const updatedAt =
    typeof value.updatedAt === "string" || value.updatedAt === null
      ? value.updatedAt
      : null;

  return {
    state: "configured",
    nodes: nodes as ServerStatusNode[],
    updatedAt,
  };
}
