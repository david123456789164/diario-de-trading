import { z } from "zod";

type Translate = (key: string) => string;

const emptyStringToNull = (value: unknown) =>
  value === "" || value === undefined || value === null ? null : value;

const requiredPositiveNumber = (message: string, t: Translate) =>
  z.preprocess(
    (value) => Number(value),
    z
      .number({ invalid_type_error: message, required_error: message })
      .finite(t("validation.validNumber"))
      .positive(message),
  );

const optionalPositiveNumber = (t: Translate) =>
  z.preprocess(
    (value) => {
      const normalized = emptyStringToNull(value);
      return normalized === null ? null : Number(normalized);
    },
    z.number().finite(t("validation.validNumber")).positive(t("validation.positive")).nullable(),
  );

const optionalTrimmedText = (t: Translate) =>
  z.preprocess(
    (value) => {
      const normalized = emptyStringToNull(value);
      if (typeof normalized !== "string") {
        return normalized;
      }

      const trimmed = normalized.trim();
      return trimmed.length === 0 ? null : trimmed;
    },
    z.string().max(4000, t("validation.textTooLong")).nullable(),
  );

const requiredDateString = (t: Translate) =>
  z
    .string({ required_error: t("validation.requiredDate") })
    .min(1, t("validation.requiredDate"))
    .refine((value) => !Number.isNaN(new Date(value).getTime()), t("validation.validDate"));

const optionalDateString = (t: Translate) =>
  z.preprocess(
    (value) => {
      const normalized = emptyStringToNull(value);
      return normalized === null ? null : String(normalized);
    },
    z
      .string()
      .refine((value) => !Number.isNaN(new Date(value).getTime()), t("validation.validDate"))
      .nullable(),
  );

const fallbackMessages: Record<string, string> = {
  "validation.validNumber": "Ingresa un número válido.",
  "validation.positive": "Debe ser mayor a 0.",
  "validation.textTooLong": "El texto es demasiado largo.",
  "validation.requiredDate": "La fecha es obligatoria.",
  "validation.validDate": "Ingresa una fecha válida.",
  "validation.tickerRequired": "El ticker es obligatorio.",
  "validation.tickerTooLong": "El ticker es demasiado largo.",
  "validation.setupRequired": "El setup es obligatorio.",
  "validation.setupTooLong": "El setup es demasiado largo.",
  "validation.entryPricePositive": "El precio de entrada debe ser mayor a 0.",
  "validation.quantityPositive": "La cantidad debe ser mayor a 0.",
  "validation.notNegative": "No puede ser negativo.",
  "validation.maxTags": "Puedes guardar hasta 12 etiquetas.",
  "validation.closedNeedsExitDate": "Si el trade está cerrado, la fecha de salida es obligatoria.",
  "validation.closedNeedsExitPrice": "Si el trade está cerrado, el precio de salida es obligatorio.",
  "validation.exitDateNeedsPrice": "Si completas la fecha de salida, también debes indicar el precio de salida.",
  "validation.exitPriceNeedsDate": "Si completas el precio de salida, también debes indicar la fecha de salida.",
  "validation.exitBeforeEntry": "La fecha de salida no puede ser anterior a la fecha de entrada.",
  "validation.longStop": "En un long, el stop loss debe quedar por debajo del precio de entrada.",
  "validation.longTakeProfit": "En un long, el take profit debe quedar por encima del precio de entrada.",
  "validation.shortStop": "En un short, el stop loss debe quedar por encima del precio de entrada.",
  "validation.shortTakeProfit": "En un short, el take profit debe quedar por debajo del precio de entrada.",
};

const fallbackT: Translate = (key) => fallbackMessages[key] ?? key;

export function createTradePayloadSchema(t: Translate = fallbackT) {
  return z
    .object({
    ticker: z
      .string({ required_error: t("validation.tickerRequired") })
      .trim()
      .min(1, t("validation.tickerRequired"))
      .max(20, t("validation.tickerTooLong")),
    assetType: z.enum(["stock", "etf"]),
    direction: z.enum(["long", "short"]),
    setup: z
      .string({ required_error: t("validation.setupRequired") })
      .trim()
      .min(1, t("validation.setupRequired"))
      .max(120, t("validation.setupTooLong")),
    entryDate: requiredDateString(t),
    exitDate: optionalDateString(t),
    entryPrice: requiredPositiveNumber(t("validation.entryPricePositive"), t),
    exitPrice: optionalPositiveNumber(t),
    initialStopLoss: optionalPositiveNumber(t),
    initialTakeProfit: optionalPositiveNumber(t),
    quantity: requiredPositiveNumber(t("validation.quantityPositive"), t),
    fees: z.preprocess(
      (value) => {
        const normalized = emptyStringToNull(value);
        return normalized === null ? 0 : Number(normalized);
      },
      z.number().finite(t("validation.validNumber")).min(0, t("validation.notNegative")),
    ),
    accountSize: optionalPositiveNumber(t),
    plannedRiskAmount: optionalPositiveNumber(t),
    thesis: optionalTrimmedText(t),
    notes: optionalTrimmedText(t),
    mistakes: optionalTrimmedText(t),
    lessonLearned: optionalTrimmedText(t),
    status: z.enum(["open", "closed", "cancelled", "invalidated"]),
    tags: z
      .array(z.string().trim().min(1).max(40))
      .max(12, t("validation.maxTags"))
      .default([]),
  })
  .superRefine((value, ctx) => {
    const entryDate = new Date(value.entryDate);
    const exitDate = value.exitDate ? new Date(value.exitDate) : null;

    if (value.status === "closed") {
      if (!value.exitDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["exitDate"],
          message: t("validation.closedNeedsExitDate"),
        });
      }

      if (!value.exitPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["exitPrice"],
          message: t("validation.closedNeedsExitPrice"),
        });
      }
    }

    if (value.exitDate && value.exitPrice === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exitPrice"],
        message: t("validation.exitDateNeedsPrice"),
      });
    }

    if (value.exitPrice !== null && !value.exitDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exitDate"],
        message: t("validation.exitPriceNeedsDate"),
      });
    }

    if (exitDate && exitDate < entryDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exitDate"],
        message: t("validation.exitBeforeEntry"),
      });
    }

    if (value.direction === "long") {
      if (value.initialStopLoss !== null && value.initialStopLoss >= value.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["initialStopLoss"],
          message: t("validation.longStop"),
        });
      }

      if (value.initialTakeProfit !== null && value.initialTakeProfit <= value.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["initialTakeProfit"],
          message: t("validation.longTakeProfit"),
        });
      }
    }

    if (value.direction === "short") {
      if (value.initialStopLoss !== null && value.initialStopLoss <= value.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["initialStopLoss"],
          message: t("validation.shortStop"),
        });
      }

      if (value.initialTakeProfit !== null && value.initialTakeProfit >= value.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["initialTakeProfit"],
          message: t("validation.shortTakeProfit"),
        });
      }
    }
  });
}

export const tradePayloadSchema = createTradePayloadSchema();

export const tradeFilterSchema = z.object({
  q: z.string().optional().default(""),
  setup: z.string().optional().default(""),
  status: z.enum(["all", "open", "closed", "cancelled", "invalidated"]).optional().default("all"),
  direction: z.enum(["all", "long", "short"]).optional().default("all"),
  result: z.enum(["all", "winner", "loser", "breakeven"]).optional().default("all"),
  from: z.string().optional().default(""),
  to: z.string().optional().default(""),
  sort: z
    .enum(["entry_date", "exit_date", "created_at", "ticker", "net_pnl", "realized_r", "holding_days"])
    .optional()
    .default("entry_date"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type TradePayloadSchema = ReturnType<typeof createTradePayloadSchema>;
export type TradePayload = z.output<TradePayloadSchema>;
export type TradeFormValues = z.input<TradePayloadSchema>;
export type TradeFilters = z.infer<typeof tradeFilterSchema>;

export function normalizeTagList(input: string) {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
