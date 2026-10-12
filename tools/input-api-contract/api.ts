/** Compile-only API declaration for FL-09a. Never ship or instantiate this fixture. */
import { Component, booleanAttribute, input } from '@angular/core';
import type { InjectionToken } from '@angular/core';
import type { AbstractControl } from '@angular/forms';

export type ForgeInputType = 'text' | 'email' | 'password';
export type ForgeInputValue = string | null;
export type ForgeErrorMessage =
  | string
  | ((error: unknown, control: AbstractControl) => string);
export type ForgeErrorMessages = Readonly<
  Record<string, ForgeErrorMessage | undefined>
>;

export declare const FORGE_ERROR_MESSAGES: InjectionToken<ForgeErrorMessages>;
export declare function resolveForgeErrorMessage(
  control: AbstractControl,
  localMessages?: ForgeErrorMessages,
  applicationMessages?: ForgeErrorMessages,
): string | null;

@Component({ selector: 'forge-input', template: '' })
export class ForgeInput {
  readonly label = input.required<string>();
  readonly type = input<ForgeInputType>('text');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input<boolean | undefined, unknown>(undefined, {
    transform: (value) =>
      value === undefined ? undefined : booleanAttribute(value),
  });
  readonly id = input<string>();
  readonly name = input<string>();
  readonly autocomplete = input<string>();
  readonly errorMessages = input<ForgeErrorMessages>({});
}
