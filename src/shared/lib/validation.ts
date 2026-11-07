export const AVATAR_MAX_BYTES = 1_000_000;
export const AVATAR_MEDIA_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function isValidAvatar(file: { size: number; type: string }) {
  return (
    file.size <= AVATAR_MAX_BYTES && AVATAR_MEDIA_TYPES.includes(file.type)
  );
}

export function requireMatchingPasswords(
  password: unknown,
  confirmation: unknown,
) {
  if (password !== confirmation) throw new Error("As senhas devem coincidir");
}

export interface FieldValidity {
  valueMissing: boolean;
  typeMismatch: boolean;
  tooShort: boolean;
  patternMismatch: boolean;
}

export function validationMessage(
  validity: FieldValidity,
  minLength: number,
  fallback: string,
) {
  if (validity.valueMissing) return "Preencha este campo.";
  if (validity.typeMismatch) return "Informe um valor válido.";
  if (validity.tooShort) return `Use pelo menos ${minLength} caracteres.`;
  if (validity.patternMismatch) return "Confira o formato informado.";
  return fallback;
}
