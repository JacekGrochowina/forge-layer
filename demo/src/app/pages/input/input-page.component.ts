import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ForgeButton, ForgeInput, ForgeInputType } from '@forge-layer/angular';
import { ApiProperty, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ExampleCardComponent } from '../../shared/example-card/example-card.component';

@Component({
  selector: 'app-input-page',
  imports: [ReactiveFormsModule, ForgeInput, ForgeButton, ApiTableComponent, ExampleCardComponent, MatFormFieldModule, MatSelectModule, MatSlideToggleModule],
  templateUrl: './input-page.component.html',
  styleUrl: './input-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPageComponent {
  readonly type = signal<ForgeInputType>('text');
  readonly readonly = signal(false);
  readonly required = signal(false);
  readonly control = new FormControl('');
  readonly disabled = signal(false);
  readonly readonlyControl = new FormControl('You can copy this value');
  readonly disabledControl = new FormControl({ value: 'Unavailable', disabled: true });
  readonly form = new FormGroup({
    email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
  });
  readonly playgroundCode = computed(() => `// import { FormControl, ReactiveFormsModule } from '@angular/forms';\ncontrol = new FormControl(${this.disabled() ? "{ value: '', disabled: true }" : "''"});\n\n<forge-input\n  label="Your value"\n  type="${this.type()}"\n  placeholder="Enter a value"\n  hint="Try typing, clearing and resetting"\n  [formControl]="control"${this.readonly() ? '\n  [readonly]="true"' : ''}${this.required() ? '\n  [required]="true"' : ''}\n/>`);
  readonly formCode = `form = new FormGroup({
  email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
  password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
});

<form [formGroup]="form" #formDirective="ngForm">
  <forge-input label="Email" type="email" autocomplete="email" formControlName="email" />
  <forge-input label="Password" type="password" autocomplete="new-password" formControlName="password" />
  <forge-button type="submit">Submit</forge-button>
  <forge-button type="button" (click)="formDirective.resetForm()">Reset</forge-button>
</form>`;
  readonly api: ApiProperty[] = [
    { property: 'label', type: 'string', default: 'Required', description: 'Visible, accessible label.' },
    { property: 'type', type: "'text' | 'email' | 'password'", default: "'text'", description: 'Native input type. Email validation requires Validators.email.' },
    { property: 'placeholder', type: 'string', default: "''", description: 'Example value; does not replace the label.' },
    { property: 'hint', type: 'string', default: "''", description: 'Supporting text associated with the input.' },
    { property: 'readonly', type: 'boolean', default: 'false', description: 'Prevents editing while allowing focus and copying.' },
    { property: 'required', type: 'boolean | undefined', default: 'undefined', description: 'Adds required validation. Validators.required is also detected from the control.' },
    { property: 'id', type: 'string | undefined', default: 'Generated', description: 'Unique ID forwarded to the native input.' },
    { property: 'name', type: 'string | undefined', default: 'undefined', description: 'Native input name.' },
    { property: 'autocomplete', type: 'string | undefined', default: 'undefined', description: 'Native autocomplete hint.' },
    { property: 'errorMessages', type: 'ForgeErrorMessages', default: '{}', description: 'Reserved for upcoming validation message display; currently has no visual effect.' },
  ];

  setDisabled(disabled: boolean): void {
    this.disabled.set(disabled);
    if (disabled) this.control.disable();
    else this.control.enable();
  }
}
