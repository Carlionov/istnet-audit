import type { ServerLocationId } from "@/data/servers";

/**
 * Explicit integration boundary retained after the DOM runtime migration.
 * Keep these values stable for the status API and external analytics consumers.
 */
export const MISTNET_INTEGRATION_CONTRACTS = {
  statusEndpoint: "/api/status",
  conversionEventName: "mistnet:conversion",
} as const;

export type MistnetConversionAction = "cabinet_open" | "trial_open" | "quick_purchase";

export type ServerNodeId = ServerLocationId;
export type ServerNodeStatus = "online" | "offline" | "unknown";

export interface ServerStatusNode {
  readonly id: ServerNodeId;
  readonly status: ServerNodeStatus;
  readonly latencyMs: number | null;
}

export interface ServerStatusConfiguredResponse {
  readonly state: "configured";
  readonly nodes: readonly ServerStatusNode[];
  readonly updatedAt: string | null;
}

export interface ServerStatusUnconfiguredResponse {
  readonly state: "unconfigured";
  readonly message?: string;
  readonly nodes?: readonly ServerStatusNode[];
}

export interface ServerStatusErrorResponse {
  readonly state: "error";
  readonly message: string;
}

export type ServerStatusResponse =
  | ServerStatusConfiguredResponse
  | ServerStatusUnconfiguredResponse
  | ServerStatusErrorResponse;

export interface MistnetConversionDetail {
  readonly [key: string]: unknown;
  readonly event: MistnetConversionAction;
  readonly plan: string | null;
  readonly destination: string | null;
}

/** The dataLayer event carries the original conversion action (trial_open, etc.). */
export type MistnetDataLayerEvent = MistnetConversionDetail;
