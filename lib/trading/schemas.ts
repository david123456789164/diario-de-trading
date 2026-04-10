import { z } from "zod";

const emptyStringToNull = (value: unknown) =>
  value === "" || value === undefined || value === null ? null : value;

const requiredPositiveNumber = (message: string) =>
  z.preprocess(
    (value) => Number(value),
    z
      .number({ invalid_type_error: message, required_error: message })
      .finite("Ingresa un número válido.")
      .positive(message),
  );

const optionalPositiveNumber = () =>
  z.preprocess(
    (value) => {
      const normalized = emptyStringToNull(value);
      return normalized === null ? null : Number(normalized);
    },
    z.number().finite("Ingresa un número válido.").positive("Debe ser mayor a 0.").nullable(),
  );

const optionalTrimmedText = z.preprocess(
  (value) => {
    const normalized = emptyStringToNull(value);
    if (typeof normalized !== "string") {
      return normalized;
    }

    const trimmed = normalized.trim();
    return trimmed.length === 0 ? null : trimmed;
  },
  z.string().max(4000, "El texto es demasiado largo.").nullable(),
);

const requiredDateString = z
  .string({ required_error: "La fecha es obligatoria." })
  .min(1, "La fecha es obligatoria.")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Ingresa una fecha válida.");

const optionalDateString = z.preprocess(
  (value) => {
    const normalized = emptyStringToNull(value);
    return normalized === null ? null : String(normalized);
  },
  z
    .string()
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Ingresa una fecha válida.")
    .nullable(),
);

export const tradePayloadSchema = z
  .object({
    ticker: z
      .string({ required_error: "El ticker es obligatorio." })
      .trim()
      .min(1, "El ticker es obligatorio.")
      .max(20, "El ticker es demasiado largo."),
    assetType: z.enum(["stock", "etf"]),
    direction: z.enum(["long", "short"]),
    setup: z
      .string({ required_error: "El setup es obligatorio." })
      .trim()
      .min(1, "El setup es obligatorio.")
      .max(120, "El setup es demasiado largo."),
    entryDate: requiredDateString,
    exitDate: optionalDateString,
    entryPrice: requiredPositiveNumber("El precio de entrada debe ser mayor a 0."),
    exitPrice: optionalPositiveNumber(),
    initialStopLoss: optionalPositiveNumber(),
    initialTakeProfit: optionalPositiveNumber(),
    quantity: requiredPositiveNumber("La cantidad debe ser mayor a 0."),
    fees: z.preprocess(
      (value) => {
        const normalized = emptyStringToNull(value);
        return normalized === null ? 0 : Number(normalized);
      },
      z.number().finite("Ingresa un número válido.").min(0, "No puede ser negativo."),
    ),
    accountSize: optionalPositiveNumber(),
    plannedRiskAmount: optionalPositiveNumber(),
    thesis: optionalTrimmedText,
    notes: optionalTrimmedText,
    mistakes: optionalTrimmedText,
    lessonLearned: optionalTrimmedText,
    status: z.enum(["open", "closed", "cancelled", "invalidated"]),
    tags: z
      .array(z.string().trim().min(1).max(40))
      .max(12, "Puedes guardar hasta 12 etiquetas.")
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
          message: "Si el trade está cerrado, la fecha de salida es obligatoria.",
        });
      }

      if (!value.exitPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["exitPrice"],
          message: "Si el trade está cerrado, el precio de salida es obligatorio.",
        });
      }
    }

    if (value.exitDate && value.exitPrice === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exitPrice"],
        message: "Si completas la fecha de salida, también debes indicar el precio de salida.",
      });
    }

    if (value.exitPrice !== null && !value.exitDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exitDate"],
        message: "Si completas el precio de salida, también debes indicar la fecha de salida.",
      });
    }

    if (exitDate && exitDate < entryDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exitDate"],
        message: "La fecha de salida no puede ser anterior a la fecha de entrada.",
      });
    }

    if (value.direction === "long") {
      if (value.initialStopLoss !== null && value.initialStopLoss >= value.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["initialStopLoss"],
          message: "En un long, el stop loss debe quedar por debajo del precio de entrada.",
        });
      }

      if (value.initialTakeProfit !== null && value.initialTakeProfit <= value.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["initialTakeProfit"],
          message: "En un long, el take profit debe quedar por encima del precio de entrada.",
        });
      }
    }

    if (value.direction === "short") {
      if (value.initialStopLoss !== null && value.initialStopLoss <= value.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["initialStopLoss"],
          message: "En un short, el stop loss debe quedar por encima del precio de entrada.",
        });
      }

      if (value.initialTakeProfit !== null && value.initialTakeProfit >= value.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["initialTakeProfit"],
          message: "En un short, el take profit debe quedar por debajo del precio de entrada.",
        });
      }
    }
  });

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

export type TradePayload = z.output<typeof tradePayloadSchema>;
export type TradeFormValues = z.input<typeof tradePayloadSchema>;
export type TradeFilters = z.infer<typeof tradeFilterSchema>;

export function normalizeTagList(input: string) {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
