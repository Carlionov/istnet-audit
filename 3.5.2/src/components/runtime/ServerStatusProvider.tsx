"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useInterval } from "@/hooks/runtime/useInterval";
import { SERVER_LOCATIONS } from "@/data/servers";
import { usePageVisibility } from "@/hooks/runtime/usePageVisibility";
import {
  MISTNET_INTEGRATION_CONTRACTS,
  type ServerNodeId,
  type ServerNodeStatus,
} from "@/lib/runtime/contracts";
import { parseServerStatusResponse } from "@/lib/runtime/status";

export type ServerMonitorMode = "loading" | "demo" | "live" | "unavailable";

export interface ServerNodeView {
  readonly id: ServerNodeId;
  readonly status: ServerNodeStatus;
  readonly latencyMs: number | null;
}

export interface ServerStatusContextValue {
  readonly mode: ServerMonitorMode;
  readonly nodes: Readonly<Record<ServerNodeId, ServerNodeView>>;
  readonly updatedAt: string | null;
  readonly message: string;
  readonly summary: string;
}

const SERVER_IDS: readonly ServerNodeId[] = SERVER_LOCATIONS.map((location) => location.id);
const INITIAL_VALUES: Record<ServerNodeId, number> = Object.fromEntries(
  SERVER_LOCATIONS.map((location) => [location.id, location.initialDemoPing]),
) as Record<ServerNodeId, number>;

function createInitialNodes(): Record<ServerNodeId, ServerNodeView> {
  return Object.fromEntries(
    SERVER_IDS.map((id) => [id, { id, status: "unknown", latencyMs: null }]),
  ) as Record<ServerNodeId, ServerNodeView>;
}

const ServerStatusContext = createContext<ServerStatusContextValue | null>(null);

export interface ServerStatusProviderProps {
  readonly children: ReactNode;
}

export function ServerStatusProvider({ children }: ServerStatusProviderProps) {
  const [mode, setMode] = useState<ServerMonitorMode>("loading");
  const [nodes, setNodes] = useState<Record<ServerNodeId, ServerNodeView>>(createInitialNodes);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [message, setMessage] = useState("Проверяем, подключён ли реальный мониторинг…");
  const [summary, setSummary] = useState("ПРОВЕРКА МОНИТОРИНГА");
  const isVisible = usePageVisibility();
  const requestControllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!isVisible || requestControllerRef.current) return;

    const controller = new AbortController();
    requestControllerRef.current = controller;

    try {
      const response = await fetch(MISTNET_INTEGRATION_CONTRACTS.statusEndpoint, {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      const parsed = parseServerStatusResponse(payload);

      if (!parsed) throw new Error("Некорректный ответ мониторинга.");

      if (parsed.state === "unconfigured") {
        setMode("demo");
        setNodes((current) =>
          Object.fromEntries(
            SERVER_IDS.map((id) => [id, { id, status: "unknown", latencyMs: current[id].latencyMs ?? INITIAL_VALUES[id] }]),
          ) as Record<ServerNodeId, ServerNodeView>,
        );
        setUpdatedAt(null);
        setSummary("ДЕМО-ПИНГ · API НЕ ПОДКЛЮЧЁН");
        setMessage("Значения меняются в диапазоне 42–94 мс для демонстрации интерфейса. Это не реальные замеры и не подтверждение доступности серверов.");
        return;
      }

      if (!response.ok || parsed.state === "error") {
        throw new Error(parsed.state === "error" ? parsed.message : "Мониторинг недоступен.");
      }

      const nextNodes = createInitialNodes();
      parsed.nodes.forEach((node) => {
        nextNodes[node.id] = node;
      });
      const anyOnline = SERVER_IDS.some((id) => nextNodes[id].status === "online");
      const anyOffline = SERVER_IDS.some((id) => nextNodes[id].status === "offline");

      setMode("live");
      setNodes(nextNodes);
      setUpdatedAt(parsed.updatedAt);
      setSummary(anyOffline ? "ЕСТЬ НЕДОСТУПНЫЕ УЗЛЫ" : anyOnline ? "МОНИТОРИНГ АКТИВЕН" : "НЕТ ДАННЫХ");
      setMessage(
        parsed.updatedAt
          ? `Данные мониторинга обновлены: ${new Date(parsed.updatedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}.`
          : "Статус и задержка получены из API мониторинга.",
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      setMode("unavailable");
      setNodes((current) =>
        Object.fromEntries(SERVER_IDS.map((id) => [id, { ...current[id], status: "unknown", latencyMs: null }])) as Record<ServerNodeId, ServerNodeView>,
      );
      setUpdatedAt(null);
      setSummary("МОНИТОРИНГ НЕДОСТУПЕН");
      setMessage(error instanceof Error ? error.message : "Не удалось получить данные мониторинга.");
    } finally {
      if (requestControllerRef.current === controller) requestControllerRef.current = null;
    }
  }, [isVisible]);

  useEffect(() => {
    void refresh();
    return () => {
      const controller = requestControllerRef.current;
      requestControllerRef.current = null;
      controller?.abort();
    };
  }, [refresh]);

  useInterval(() => void refresh(), 30000, isVisible && mode !== "loading");

  useInterval(
    () => {
      const deltas = Object.fromEntries(
        SERVER_IDS.map((id) => [
          id,
          Math.floor(Math.random() * 9) - 4 || (Math.random() > 0.5 ? 1 : -1),
        ]),
      ) as Record<ServerNodeId, number>;

      setNodes((current) => {
        const next = { ...current };
        SERVER_IDS.forEach((id) => {
          const currentValue = current[id].latencyMs ?? INITIAL_VALUES[id];
          next[id] = {
            id,
            status: "unknown",
            latencyMs: Math.max(42, Math.min(94, currentValue + deltas[id])),
          };
        });
        return next;
      });
    },
    2600,
    isVisible && mode === "demo",
  );

  const value = useMemo<ServerStatusContextValue>(
    () => ({ mode, nodes, updatedAt, message, summary }),
    [message, mode, nodes, summary, updatedAt],
  );

  return <ServerStatusContext.Provider value={value}>{children}</ServerStatusContext.Provider>;
}

export function useServerStatus(): ServerStatusContextValue {
  const context = useContext(ServerStatusContext);
  if (!context) throw new Error("useServerStatus must be used within ServerStatusProvider");
  return context;
}
