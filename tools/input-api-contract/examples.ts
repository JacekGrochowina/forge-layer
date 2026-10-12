import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ForgeInput, type ForgeErrorMessages } from '@forge-layer/angular';

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
