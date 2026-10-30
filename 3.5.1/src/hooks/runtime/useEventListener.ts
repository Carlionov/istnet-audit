"use client";

import { useEffect } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";

type EventMapFor<TTarget> = TTarget extends Window
  ? WindowEventMap
  : TTarget extends Document
    ? DocumentEventMap
    : TTarget extends HTMLElement
      ? HTMLElementEventMap
      : Record<string, Event>;

export interface UseEventListenerOptions extends AddEventListenerOptions {
  readonly enabled?: boolean;
}

/** Adds a typed DOM listener and always dispatches to the latest callback. */
export function useEventListener<
  TTarget extends EventTarget,
  TEventMap = EventMapFor<TTarget>,
  TEventName extends keyof TEventMap & string = keyof TEventMap & string,
>(
  target: TTarget | null | undefined,
  eventName: TEventName,
  handler: (event: TEventMap[TEventName]) => void,
  options: UseEventListenerOptions = {},
): void {
  const handlerRef = useLatest(handler);
  const { enabled = true, capture = false, once = false, passive = false } = options;

  useEffect(() => {
    if (!enabled || !target) return;

    const listener: EventListener = (event) => {
      handlerRef.current(event as TEventMap[TEventName]);
    };

    target.addEventListener(eventName, listener, { capture, once, passive });

    return () => {
      target.removeEventListener(eventName, listener, capture);
    };
  }, [capture, enabled, eventName, handlerRef, once, passive, target]);
}
