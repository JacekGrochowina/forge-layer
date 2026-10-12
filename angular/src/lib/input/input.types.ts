import type { AbstractControl } from '@angular/forms';

export type ForgeInputType = 'text' | 'email' | 'password';
export type ForgeInputValue = string | null;
export type ForgeErrorMessage =
  | string
  | ((error: unknown, control: AbstractControl) => string);
export type ForgeErrorMessages = Readonly<
  Record<string, ForgeErrorMessage | undefined>
>;
