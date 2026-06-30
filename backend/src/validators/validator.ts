import Validator, {
  type SyncCheckFunction,
  type ValidationError,
  type ValidationSchema,
} from "fastest-validator";
import type { Response } from "express";
import type { ValidationResult } from "./validator.types";

export const validator = new Validator();

export function validate<T>(check: SyncCheckFunction, payload: unknown): ValidationResult<T> {
  const data = clonePayload(payload);
  const result = check(data);

  if (result === true) {
    return { ok: true, data: data as T };
  }

  return { ok: false, errors: result };
}

export function compileSchema(schema: ValidationSchema<any>): SyncCheckFunction {
  const check = validator.compile(schema);
  if (check.async) {
    throw new Error("Async validators are not supported for request validation");
  }

  return check;
}

export function sendValidationError(res: Response, result: { ok: false; errors: ValidationError[] }) {
  return res.status(400).json({
    error: result.errors.map((err) => err.message).join(", "),
    details: result.errors,
  });
}

function clonePayload(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return {};
  return { ...(payload as Record<string, unknown>) };
}
