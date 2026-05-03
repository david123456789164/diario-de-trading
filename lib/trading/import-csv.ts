import { ZodError } from "zod";

import { createTradePayloadSchema, normalizeTagList, type TradePayload } from "@/lib/trading/schemas";

type Translate = (key: string, options?: Record<string, unknown>) => string;

export type TradeImportError = {
  row: number;
  message: string;
};

export type ParsedTradeImport = {
  trades: TradePayload[];
  errors: TradeImportError[];
};

const headerAliases: Record<keyof TradePayload, string[]> = {
  ticker: ["ticker", "symbol", "simbolo", "símbolo"],
  assetType: ["assettype", "asset_type", "asset", "activo", "tipo de activo"],
  direction: ["direction", "direccion", "dirección"],
  setup: ["setup", "strategy", "estrategia"],
  entryDate: ["entrydate", "entry_date", "entry date", "fecha entrada", "fecha de entrada"],
  exitDate: ["exitdate", "exit_date", "exit date", "fecha salida", "fecha de salida"],
  entryPrice: ["entryprice", "entry_price", "entry price", "precio entrada", "precio de entrada"],
  exitPrice: ["exitprice", "exit_price", "exit price", "precio salida", "precio de salida"],
  initialStopLoss: ["initialstoploss", "initial_stop_loss", "initial stop loss", "stop loss inicial"],
  initialTakeProfit: ["initialtakeprofit", "initial_take_profit", "initial take profit", "take profit inicial"],
  quantity: ["quantity", "qty", "shares", "cantidad"],
  fees: ["fees", "commissions", "comisiones"],
  accountSize: ["accountsize", "account_size", "account size", "tamano de cuenta", "tamaño de cuenta"],
  plannedRiskAmount: [
    "plannedriskamount",
    "planned_risk_amount",
    "planned risk amount",
    "riesgo planeado",
    "riesgo planeado en usd",
  ],
  thesis: ["thesis", "entry thesis", "tesis", "tesis de entrada"],
  notes: ["notes", "nota", "notas"],
  mistakes: ["mistakes", "errores", "errores cometidos"],
  lessonLearned: ["lessonlearned", "lesson_learned", "lesson learned", "aprendizaje"],
  status: ["status", "estado"],
  tags: ["tags", "etiquetas"],
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value);
  rows.push(row);

  return rows.filter((csvRow) => csvRow.some((cell) => cell.trim().length > 0));
}

function createHeaderMap(headers: string[]) {
  const normalizedHeaders = headers.map(normalizeHeader);
  const map = new Map<keyof TradePayload, number>();

  Object.entries(headerAliases).forEach(([field, aliases]) => {
    const index = normalizedHeaders.findIndex((header) =>
      aliases.some((alias) => normalizeHeader(alias) === header),
    );
    if (index >= 0) {
      map.set(field as keyof TradePayload, index);
    }
  });

  return map;
}

function getCell(row: string[], headerMap: Map<keyof TradePayload, number>, field: keyof TradePayload) {
  const index = headerMap.get(field);
  return index === undefined ? "" : row[index]?.trim() ?? "";
}

function normalizeEnum(value: string, fallback: string, aliases: Record<string, string>) {
  const normalized = normalizeHeader(value);
  if (!normalized) return fallback;
  return aliases[normalized] ?? normalized.replace(/\s+/g, "_");
}

function buildRawPayload(row: string[], headerMap: Map<keyof TradePayload, number>) {
  const tags = getCell(row, headerMap, "tags").replace(/\|/g, ",");

  return {
    ticker: getCell(row, headerMap, "ticker"),
    assetType: normalizeEnum(getCell(row, headerMap, "assetType"), "stock", {
      accion: "stock",
      stock: "stock",
      share: "stock",
      equity: "stock",
      etf: "etf",
    }),
    direction: normalizeEnum(getCell(row, headerMap, "direction"), "long", {
      long: "long",
      largo: "long",
      compra: "long",
      short: "short",
      corto: "short",
      venta: "short",
    }),
    setup: getCell(row, headerMap, "setup"),
    entryDate: getCell(row, headerMap, "entryDate"),
    exitDate: getCell(row, headerMap, "exitDate"),
    entryPrice: getCell(row, headerMap, "entryPrice"),
    exitPrice: getCell(row, headerMap, "exitPrice"),
    initialStopLoss: getCell(row, headerMap, "initialStopLoss"),
    initialTakeProfit: getCell(row, headerMap, "initialTakeProfit"),
    quantity: getCell(row, headerMap, "quantity"),
    fees: getCell(row, headerMap, "fees"),
    accountSize: getCell(row, headerMap, "accountSize"),
    plannedRiskAmount: getCell(row, headerMap, "plannedRiskAmount"),
    thesis: getCell(row, headerMap, "thesis"),
    notes: getCell(row, headerMap, "notes"),
    mistakes: getCell(row, headerMap, "mistakes"),
    lessonLearned: getCell(row, headerMap, "lessonLearned"),
    status: normalizeEnum(getCell(row, headerMap, "status"), "open", {
      open: "open",
      abierto: "open",
      abierta: "open",
      closed: "closed",
      cerrado: "closed",
      cerrada: "closed",
      cancelled: "cancelled",
      canceled: "cancelled",
      cancelado: "cancelled",
      cancelada: "cancelled",
      invalidated: "invalidated",
      invalidado: "invalidated",
      invalidada: "invalidated",
    }),
    tags: normalizeTagList(tags),
  };
}

function formatZodError(error: ZodError) {
  const firstIssue = error.issues[0];
  if (!firstIssue) return "Invalid row.";
  const field = firstIssue.path.join(".");
  return field ? `${field}: ${firstIssue.message}` : firstIssue.message;
}

export function parseTradesCsvImport(csv: string, t: Translate): ParsedTradeImport {
  const rows = parseCsv(csv.replace(/^\uFEFF/, ""));
  const [headers, ...dataRows] = rows;
  const schema = createTradePayloadSchema(t);
  const trades: TradePayload[] = [];
  const errors: TradeImportError[] = [];

  if (!headers || dataRows.length === 0) {
    return {
      trades,
      errors: [{ row: 1, message: t("import.errors.emptyFile") }],
    };
  }

  const headerMap = createHeaderMap(headers);
  const requiredFields: Array<keyof TradePayload> = ["ticker", "setup", "entryDate", "entryPrice", "quantity"];
  const missingRequired = requiredFields.filter((field) => !headerMap.has(field));

  if (missingRequired.length > 0) {
    return {
      trades,
      errors: [
        {
          row: 1,
          message: t("import.errors.missingHeaders", { headers: missingRequired.join(", ") }),
        },
      ],
    };
  }

  dataRows.forEach((row, index) => {
    try {
      trades.push(schema.parse(buildRawPayload(row, headerMap)));
    } catch (error) {
      errors.push({
        row: index + 2,
        message: error instanceof ZodError ? formatZodError(error) : t("import.errors.invalidRow"),
      });
    }
  });

  return { trades, errors };
}

export const tradeImportTemplateHeaders = [
  "ticker",
  "assetType",
  "direction",
  "setup",
  "status",
  "entryDate",
  "exitDate",
  "entryPrice",
  "exitPrice",
  "initialStopLoss",
  "initialTakeProfit",
  "quantity",
  "fees",
  "accountSize",
  "plannedRiskAmount",
  "thesis",
  "notes",
  "mistakes",
  "lessonLearned",
  "tags",
];
