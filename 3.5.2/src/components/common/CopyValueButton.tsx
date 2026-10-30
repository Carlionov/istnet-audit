"use client";

import { useState } from "react";
import { useRuntimeUI } from "@/components/runtime/RuntimeUIProvider";

export interface CopyValueButtonProps {
  readonly value: string;
  readonly label: string;
  readonly children: string;
}

export function CopyValueButton({ value, label, children }: CopyValueButtonProps) {
  const { showToast } = useRuntimeUI();
  const [copying, setCopying] = useState(false);

  const copy = async () => {
    if (copying) return;
    setCopying(true);

    try {
      await navigator.clipboard.writeText(value);
      showToast("Скопировано");
    } catch {
      showToast("Не удалось скопировать. Скопируй адрес вручную.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <button
      aria-label={label}
      className="copy-value"
      disabled={copying}
      onClick={() => void copy()}
      type="button"
    >
      {children}
    </button>
  );
}
