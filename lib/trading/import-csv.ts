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

const monthAliases: Record<string, string> = {
  january: "01",
  enero: "01",
  jan: "01",
  february: "02",
  febrero: "02",
  feb: "02",
  march: "03",
  marzo: "03",
  mar: "03",
  april: "04",
  abril: "04",
  apr: "04",
  may: "05",
  mayo: "05",
  june: "06",
  junio: "06",
  jun: "06",
  july: "07",
  julio: "07",
  jul: "07",
  august: "08",
  agosto: "08",
  aug: "08",
  september: "09",
  septiembre: "09",
  sep: "09",
  october: "10",
  octubre: "10",
  oct: "10",
  november: "11",
  noviembre: "11",
  nov: "11",
  december: "12",
  diciembre: "12",
  dec: "12",
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

function createNamedIndex(headers: string[]) {
  return new Map(headers.map((header, index) => [normalizeHeader(header), index]));
}

function getNamedCell(row: string[], headerIndex: Map<string, number>, header: string) {
  const index = headerIndex.get(normalizeHeader(header));
  return index === undefined ? "" : row[index]?.trim() ?? "";
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

function parseStatementDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return new Date().toISOString().slice(0, 10);

  const isoMatch = trimmed.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const namedMonthMatch = trimmed.match(/^([^,\d]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (namedMonthMatch) {
    const month = monthAliases[normalizeHeader(namedMonthMatch[1])];
    const day = namedMonthMatch[2].padStart(2, "0");
    if (month) return `${namedMonthMatch[3]}-${month}-${day}`;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : parsed.toISOString().slice(0, 10);
}

function getStatementPeriodDate(rows: string[][]) {
  const periodRow = rows.find((row) => normalizeHeader(row[0] ?? "") === "statement" && normalizeHeader(row[2] ?? "") === "period");
  return parseStatementDate(periodRow?.[3] ?? "");
}

function findSection(rows: string[][], sectionName: string) {
  const normalizedSection = normalizeHeader(sectionName);
  const headerRowIndex = rows.findIndex(
    (row) => normalizeHeader(row[0] ?? "") === normalizedSection && normalizeHeader(row[1] ?? "") === "header",
  );

  if (headerRowIndex < 0) {
    return null;
  }

  const headers = rows[headerRowIndex].slice(2);
  const dataRows = rows
    .slice(headerRowIndex + 1)
    .filter((row) => normalizeHeader(row[0] ?? "") === normalizedSection && normalizeHeader(row[1] ?? "") === "data")
    .map((row, index) => ({ rowNumber: headerRowIndex + index + 2, values: row.slice(2) }));

  return { headers, dataRows };
}

function parseBrokerStatementImport(rows: string[][], t: Translate): ParsedTradeImport | null {
  const openPositions = findSection(rows, "Posiciones abiertas") ?? findSection(rows, "Open Positions");

  if (!openPositions) {
    return null;
  }

  const instruments = findSection(rows, "Información de instrumento financiero") ?? findSection(rows, "Financial Instrument Information");
  const instrumentTypes = new Map<string, "stock" | "etf">();

  if (instruments) {
    const instrumentIndex = createNamedIndex(instruments.headers);
    instruments.dataRows.forEach(({ values }) => {
      const ticker = getNamedCell(values, instrumentIndex, "Símbolo").toUpperCase();
      const type = normalizeHeader(getNamedCell(values, instrumentIndex, "Tipo"));
      if (ticker) {
        instrumentTypes.set(ticker, type === "etf" ? "etf" : "stock");
      }
    });
  }

  const statementDate = getStatementPeriodDate(rows);
  const headerIndex = createNamedIndex(openPositions.headers);
  const schema = createTradePayloadSchema(t);
  const trades: TradePayload[] = [];
  const errors: TradeImportError[] = [];

  openPositions.dataRows.forEach(({ rowNumber, values }) => {
    const ticker = getNamedCell(values, headerIndex, "Símbolo").toUpperCase();
    const quantity = Number(getNamedCell(values, headerIndex, "Cantidad"));
    const entryPrice = getNamedCell(values, headerIndex, "Precio de coste");

    if (!ticker || !Number.isFinite(quantity) || quantity === 0 || !entryPrice) {
      return;
    }

    try {
      trades.push(
        schema.parse({
          ticker,
          assetType: instrumentTypes.get(ticker) ?? "stock",
          direction: quantity > 0 ? "long" : "short",
          setup: t("import.brokerStatement.setup"),
          entryDate: statementDate,
          exitDate: "",
          entryPrice,
          exitPrice: "",
          initialStopLoss: "",
          initialTakeProfit: "",
          quantity: Math.abs(quantity),
          fees: 0,
          accountSize: "",
          plannedRiskAmount: "",
          thesis: t("import.brokerStatement.thesis"),
          notes: t("import.brokerStatement.notes", { date: statementDate }),
          mistakes: "",
          lessonLearned: "",
          status: "open",
          tags: ["ibkr-import", "open-position"],
        }),
      );
    } catch (error) {
      errors.push({
        row: rowNumber,
        message: error instanceof ZodError ? formatZodError(error) : t("import.errors.invalidRow"),
      });
    }
  });

  if (trades.length === 0 && errors.length === 0) {
    return {
      trades,
      errors: [{ row: 1, message: t("import.errors.noBrokerPositions") }],
    };
  }

  return { trades, errors };
}

function parseCompactDate(value: string) {
  const trimmed = value.trim();
  const compact = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) {
    return `${compact[1]}-${compact[2]}-${compact[3]}`;
  }

  return parseStatementDate(trimmed);
}

function getOptionalQuantity(row: string[], headerIndex: Map<string, number>) {
  const rawQuantity =
    getNamedCell(row, headerIndex, "Quantity") ||
    getNamedCell(row, headerIndex, "Qty") ||
    getNamedCell(row, headerIndex, "Shares") ||
    getNamedCell(row, headerIndex, "Cantidad");
  const quantity = Number(rawQuantity);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function parsePersonalTradeCsv(rows: string[][], t: Translate): ParsedTradeImport | null {
  const [headers, ...dataRows] = rows;
  if (!headers) return null;

  const headerIndex = createNamedIndex(headers);
  const hasPersonalFormat =
    headerIndex.has("symbol") &&
    headerIndex.has("tradedate") &&
    headerIndex.has("tradeprice") &&
    headerIndex.has("buy/sell");

  if (!hasPersonalFormat) {
    return null;
  }

  type Execution = {
    rowNumber: number;
    ticker: string;
    date: string;
    price: string;
    side: "BUY" | "SELL";
    quantity: number;
  };

  const schema = createTradePayloadSchema(t);
  const executions: Execution[] = [];
  const errors: TradeImportError[] = [];

  dataRows.forEach((row, index) => {
    const ticker = getNamedCell(row, headerIndex, "Symbol").toUpperCase();
    const date = parseCompactDate(getNamedCell(row, headerIndex, "TradeDate"));
    const price = getNamedCell(row, headerIndex, "TradePrice");
    const side = getNamedCell(row, headerIndex, "Buy/Sell").toUpperCase();
    const quantity = getOptionalQuantity(row, headerIndex);

    if (!ticker && !price && !side) return;

    if (!ticker || !price || (side !== "BUY" && side !== "SELL")) {
      errors.push({ row: index + 2, message: t("import.errors.invalidRow") });
      return;
    }

    executions.push({
      rowNumber: index + 2,
      ticker,
      date,
      price,
      side,
      quantity,
    });
  });

  const pendingByTicker = new Map<string, Execution[]>();
  const trades: TradePayload[] = [];

  function addTrade(payload: Record<string, unknown>, rowNumber: number) {
    try {
      trades.push(schema.parse(payload));
    } catch (error) {
      errors.push({
        row: rowNumber,
        message: error instanceof ZodError ? formatZodError(error) : t("import.errors.invalidRow"),
      });
    }
  }

  executions.forEach((execution) => {
    const pending = pendingByTicker.get(execution.ticker) ?? [];
    const oppositeIndex = pending.findIndex((item) => item.side !== execution.side);

    if (oppositeIndex >= 0) {
      const entry = pending.splice(oppositeIndex, 1)[0];
      const isLong = entry.side === "BUY";

      addTrade(
        {
          ticker: entry.ticker,
          assetType: "stock",
          direction: isLong ? "long" : "short",
          setup: t("import.personalCsv.setup"),
          entryDate: entry.date,
          exitDate: execution.date,
          entryPrice: entry.price,
          exitPrice: execution.price,
          initialStopLoss: "",
          initialTakeProfit: "",
          quantity: Math.min(entry.quantity, execution.quantity),
          fees: 0,
          accountSize: "",
          plannedRiskAmount: "",
          thesis: t("import.personalCsv.thesis"),
          notes: t("import.personalCsv.notes"),
          mistakes: "",
          lessonLearned: "",
          status: "closed",
          tags: ["personal-csv-import"],
        },
        execution.rowNumber,
      );
    } else {
      pending.push(execution);
    }

    pendingByTicker.set(execution.ticker, pending);
  });

  pendingByTicker.forEach((pending) => {
    pending.forEach((entry) => {
      addTrade(
        {
          ticker: entry.ticker,
          assetType: "stock",
          direction: entry.side === "BUY" ? "long" : "short",
          setup: t("import.personalCsv.setup"),
          entryDate: entry.date,
          exitDate: "",
          entryPrice: entry.price,
          exitPrice: "",
          initialStopLoss: "",
          initialTakeProfit: "",
          quantity: entry.quantity,
          fees: 0,
          accountSize: "",
          plannedRiskAmount: "",
          thesis: t("import.personalCsv.thesis"),
          notes: t("import.personalCsv.openNotes"),
          mistakes: "",
          lessonLearned: "",
          status: "open",
          tags: ["personal-csv-import", "open-execution"],
        },
        entry.rowNumber,
      );
    });
  });

  if (trades.length === 0 && errors.length === 0) {
    return {
      trades,
      errors: [{ row: 1, message: t("import.errors.emptyFile") }],
    };
  }

  return { trades, errors };
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
    const personalCsv = parsePersonalTradeCsv(rows, t);
    if (personalCsv) {
      return personalCsv;
    }

    const brokerStatement = parseBrokerStatementImport(rows, t);
    if (brokerStatement) {
      return brokerStatement;
    }

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
