import type { ValidationError } from "fastest-validator";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: ValidationError[] };
