/**
 * Password policy used across the app. MNC customers typically require
 * at least 12 characters with complexity.
 *
 * Changing PASSWORD_MIN_LENGTH must be done together with the backend
 * policy or users will get rejected on submit.
 */
export const PASSWORD_MIN_LENGTH = 12;

export interface PasswordIssues {
  tooShort: boolean;
  missingLower: boolean;
  missingUpper: boolean;
  missingDigit: boolean;
  missingSymbol: boolean;
}

export function passwordIssues(value: string): PasswordIssues {
  return {
    tooShort: value.length < PASSWORD_MIN_LENGTH,
    missingLower: !/[a-z]/.test(value),
    missingUpper: !/[A-Z]/.test(value),
    missingDigit: !/[0-9]/.test(value),
    missingSymbol: !/[^A-Za-z0-9]/.test(value),
  };
}

export function isPasswordStrong(value: string): boolean {
  const i = passwordIssues(value);
  return !i.tooShort && !i.missingLower && !i.missingUpper && !i.missingDigit && !i.missingSymbol;
}

export function firstPasswordError(value: string): string | undefined {
  const i = passwordIssues(value);
  if (i.tooShort) return `Minimum ${PASSWORD_MIN_LENGTH} characters`;
  if (i.missingLower) return 'Add a lowercase letter';
  if (i.missingUpper) return 'Add an uppercase letter';
  if (i.missingDigit) return 'Add a digit';
  if (i.missingSymbol) return 'Add a symbol';
  return undefined;
}

export type PasswordStrength = 'empty' | 'weak' | 'fair' | 'strong';

export function passwordStrength(value: string): PasswordStrength {
  if (!value) return 'empty';
  const i = passwordIssues(value);
  const passed = (Object.values(i).filter((v) => v === false) as boolean[]).length;
  if (i.tooShort || passed <= 2) return 'weak';
  if (passed <= 4) return 'fair';
  return 'strong';
}
