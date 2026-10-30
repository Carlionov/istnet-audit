"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTimeout } from "@/hooks/runtime/useTimeout";

export interface RuntimeUIContextValue {
  readonly commandPaletteOpen: boolean;
  readonly openCommandPalette: () => void;
  readonly closeCommandPalette: () => void;
  readonly toastMessage: string;
  readonly showToast: (message: string) => void;
}

const RuntimeUIContext = createContext<RuntimeUIContextValue | null>(null);

export interface RuntimeUIProviderProps {
  readonly children: ReactNode;
}

export function RuntimeUIProvider({ children }: RuntimeUIProviderProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVersion, setToastVersion] = useState(0);

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVersion((version) => version + 1);
  }, []);

  useTimeout(
    () => setToastMessage(""),
    toastMessage ? 2200 : null,
    Boolean(toastMessage),
    toastVersion,
  );

  const value = useMemo<RuntimeUIContextValue>(
    () => ({
      commandPaletteOpen,
      openCommandPalette,
      closeCommandPalette,
      toastMessage,
      showToast,
    }),
    [commandPaletteOpen, closeCommandPalette, openCommandPalette, showToast, toastMessage],
  );

  return <RuntimeUIContext.Provider value={value}>{children}</RuntimeUIContext.Provider>;
}

export function useRuntimeUI(): RuntimeUIContextValue {
  const context = useContext(RuntimeUIContext);
  if (!context) {
    throw new Error("useRuntimeUI must be used within RuntimeUIProvider");
  }
  return context;
}
