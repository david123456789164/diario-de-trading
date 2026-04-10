import { format } from "date-fns";

export function formatCurrency(value: number | null | undefined, currency = "USD") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number | null | undefined, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number | null | undefined, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return `${formatNumber(value, decimals)}%`;
}

export function formatCompactCurrency(value: number | null | undefined, currency = "USD") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string | Date | null | undefined, fallback = "—") {
  if (!value) {
    return fallback;
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return format(date, "dd/MM/yyyy");
}

export function formatDateTime(value: string | Date | null | undefined, fallback = "—") {
  if (!value) {
    return fallback;
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return format(date, "dd/MM/yyyy HH:mm");
}

export function formatHoldingDays(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return `${formatNumber(value, 1)} días`;
}

export function formatRatio(value: number | null | undefined, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return `${formatNumber(value, decimals)}x`;
}

