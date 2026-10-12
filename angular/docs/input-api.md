# Forge Input — FL-09a API contract

Source: [Notion implementation plan](https://app.notion.com/p/3c7f493bef5980e0ae56eacb2475a2d0).

This document specifies the MVP contract and export names approved by the owner
on 12 October 2026 for FL-09a. The component and validation runtime will be
implemented in FL-10 and FL-11. FL-10 now exports the component and input/message
types; the resolver, token and error display remain planned for FL-11.
The fixture in `tools/input-api-contract` checks both form bindings against the
built package declarations. Runtime CVA and required tests live in `input.spec.ts`.

## Public exports

All exports belong to `@forge-layer/angular`; no separate core package or global
`provideForgeLayer` API is required.

| Export                     | Contract                                                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `ForgeInput`               | Standalone, OnPush component, selector `forge-input`                                                                         |
| `ForgeInputType`           | `'text' \| 'email' \| 'password'`                                                                                            |
| `ForgeInputValue`          | `string \| null` at the ControlValueAccessor boundary                                                                        |
| `ForgeErrorMessage`        | String or `(error: unknown, control: AbstractControl) => string`                                                             |
| `ForgeErrorMessages`       | `Readonly<Record<string, ForgeErrorMessage \| undefined>>`                                                                   |
| `resolveForgeErrorMessage` | `(control: AbstractControl, localMessages?: ForgeErrorMessages, applicationMessages?: ForgeErrorMessages) => string \| null` |
| `FORGE_ERROR_MESSAGES`     | `InjectionToken<ForgeErrorMessages>` for application overrides; defaults to an empty map                                     |

`unknown` forces custom message functions to check their error payload before
using it. Angular controls may carry arbitrary validation payloads. A missing or
undefined map entry falls through to the next source; an empty string is an
explicit override. The resolver returns `null` when there are no errors. It
selects and formats a message only; the component determines when to show it.

## Component inputs

| Input           | Type                   | Default / rule                                            |
| --------------- | ---------------------- | --------------------------------------------------------- |
| `label`         | `string`               | Required visible label; supply meaningful, nonempty text  |
| `type`          | `ForgeInputType`       | `'text'`                                                  |
| `placeholder`   | `string`               | `''`; does not replace the label                          |
| `hint`          | `string`               | `''`; shown when no error is displayed                    |
| `readonly`      | `boolean`              | `false`                                                   |
| `required`      | `boolean \| undefined` | `undefined`; augments required detection from the control |
| `id`            | `string \| undefined`  | Generated unique, stable ID when omitted                  |
| `name`          | `string \| undefined`  | Omitted native attribute                                  |
| `autocomplete`  | `string \| undefined`  | Omitted native attribute                                  |
| `errorMessages` | `ForgeErrorMessages`   | Empty map                                                 |

Boolean inputs accept boolean bindings and bare attributes using Angular boolean
attribute coercion. `id`, `name` and `autocomplete` target the native input.
An explicit ID must be nonempty and unique in the page. A generated ID remains
stable across value, validation and presentation changes. Do not leave a duplicate
ID on the component host. Material owns the label and description associations.

## Value and form ownership

Use `[formControl]` or `formControlName`. The external control owns the value,
validators and disabled state. There are no `value`, `valueChange` or `disabled`
component inputs and no parallel internal validation control.

- `writeValue(null)` renders `''` without changing the control's value.
- User typing, pasting and clearing report strings, including `''` for clearing.
- Preserve whitespace and case. Do not trim, format, debounce or coerce values.
- Programmatic `setValue`, `patchValue` and reset update the view without an
  additional change callback. Blur invokes the touched callback.
- Respect Angular's `updateOn: 'change' | 'blur' | 'submit'` behavior.
- `FormControl<string | null>` supports nullable reset. A nonnullable
  `FormControl<string>` resets to its initial value according to Angular rules.
- Values outside `string | null` are outside this API; Angular's CVA interface
  itself does not statically enforce a consuming control's value type.

## Required, readonly and disabled

Detect `Validators.required` with the external control's validator API. An
explicit `required=true` also contributes a required validator to the external
control, including when a composed validator cannot be introspected. Dynamic
changes revalidate the control. `required=false` removes only Forge's explicit
requirement; it never removes a parent's validator. The effective marker,
`aria-required` and validation must agree. Validators remain owned by the form.

`type="email"` does not install `Validators.email`. Length and custom rules
belong on the external control; there are no minlength/maxlength component inputs.

Readonly permits focus and copying, keeps the value in the form and retains
validation. Disabled is controlled through `disable()`, `enable()` or the
control's initial form state and propagated by CVA. It blocks user editing and
follows Angular's form-value exclusion rules; `getRawValue()` includes disabled
controls. Disabled controls show no validation error.

## Message contract

Per error key, resolve local map → application token map → built-in message.
Overriding one key preserves defaults for every other key. Select one error in
the order required → email → minlength → maxlength → remaining keys sorted
alphabetically. Never display an error payload or a technical key as fallback.

| Key                          | Built-in Polish message                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| `required`                   | `Pole jest wymagane`                                                 |
| `email`                      | `Podaj poprawny adres email`                                         |
| `minlength`                  | `Wpisz co najmniej {requiredLength} znaków (obecnie {actualLength})` |
| `maxlength`                  | `Wpisz najwyżej {requiredLength} znaków (obecnie {actualLength})`    |
| Other / unrecognized payload | `Nieprawidłowa wartość`                                              |

Length formatters use `requiredLength` and `actualLength` from Angular validation
payloads after checking their shape. The application override is provided with
`{ provide: FORGE_ERROR_MESSAGES, useValue: messages }`.

Display an error only when the control is invalid and either touched or the
parent form is submitted. Dirty alone is insufficient; pending is not an error.
Programmatic `setErrors`, `markAllAsTouched` and disabled changes must refresh UI.
Control reset restores its value and pristine/untouched state, but does not clear
parent submitted. `FormGroupDirective.resetForm()` also clears submitted. These
rules are expanded into the [FL-09b state and validation matrix](input-state-matrix.md),
which defines acceptance scenarios for FL-10–12.

## Target examples

These examples target the agreed API. Both import from the package public entry.
The compile-only fixture maps that entry to the built package declarations.
Build the library before running `npm run test:input-api`.

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ForgeInput } from '@forge-layer/angular';

@Component({
  selector: 'app-email-control',
  imports: [ReactiveFormsModule, ForgeInput],
  template: `<forge-input
    label="Email"
    type="email"
    autocomplete="email"
    hint="Podaj adres kontaktowy"
    [formControl]="email"
  />`,
})
export class EmailControlExample {
  readonly email = new FormControl<string | null>(null, {
    validators: [Validators.required, Validators.email],
  });
}
```

```ts
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ForgeInput, type ForgeErrorMessages } from '@forge-layer/angular';

@Component({
  selector: 'app-email-form',
  imports: [ReactiveFormsModule, ForgeInput],
  template: `<form [formGroup]="form" #formDirective="ngForm">
    <forge-input
      label="Email"
      type="email"
      name="email"
      formControlName="email"
      [errorMessages]="messages"
    />
    <button type="submit">Zapisz</button>
    <button type="button" (click)="formDirective.resetForm()">Reset</button>
  </form>`,
})
export class EmailFormExample {
  readonly form = new FormGroup({
    email: new FormControl<string | null>(null, {
      validators: [Validators.required, Validators.email],
    }),
  });
  readonly messages: ForgeErrorMessages = { required: 'Email jest wymagany' };
}
```

## MVP boundary

Material form-field and native `input matInput`; text, email and password only.
Select, textarea, number/date, masks, formatter, debounce, clear button, character
counter, prefix/suffix and password visibility toggle are outside MVP. Async
validators retain Angular semantics; no custom async validation mechanism.
