import {
  MISTNET_INTEGRATION_CONTRACTS,
  type MistnetConversionDetail,
  type MistnetDataLayerEvent,
} from "@/lib/runtime/contracts";

/** Emits the public conversion event and the matching dataLayer payload. */
export function trackMistnetConversion(detail: MistnetConversionDetail): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<MistnetConversionDetail>(
      MISTNET_INTEGRATION_CONTRACTS.conversionEventName,
      { detail },
    ),
  );

  const dataLayer = window.dataLayer ?? (window.dataLayer = []);
  const event: MistnetDataLayerEvent = { ...detail };
  dataLayer.push(event);
}
