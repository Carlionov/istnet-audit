"use client";

import { useEffect, useRef } from "react";

/** Keeps the latest committed value available to long-lived effects and listeners. */
export function useLatest<T>(value: T) {
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  return valueRef;
}
