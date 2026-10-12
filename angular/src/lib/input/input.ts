import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  DoCheck,
  ElementRef,
  Injector,
  OnInit,
  booleanAttribute,
  effect,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import type {
  ForgeErrorMessages,
  ForgeInputType,
  ForgeInputValue,
} from './input.types';

let nextInputId = 0;

@Component({
  selector: 'forge-input',
  imports: [MatFormField, MatLabel, MatHint, MatInput],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.id]': 'null' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ForgeInput),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ForgeInput),
      multi: true,
    },
  ],
})
export class ForgeInput
  implements ControlValueAccessor, Validator, OnInit, DoCheck
{
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
  protected readonly generatedId = `forge-input-${nextInputId++}`;
  protected readonly text = signal('');
  protected readonly disabled = signal(false);
  private readonly injector = inject(Injector);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private ngControl: NgControl | null = null;
  private observedControl: AbstractControl | null = null;
  private controlEvents?: ReturnType<AbstractControl['events']['subscribe']>;
  private readonly nativeInput =
    viewChild<ElementRef<HTMLInputElement>>('nativeInput');
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;

  constructor() {
    this.destroyRef.onDestroy(() => this.controlEvents?.unsubscribe());
    effect(() => {
      this.required();
      this.onValidatorChange();
    });
  }

  ngOnInit(): void {
    // Resolve after form directive construction: its accessor/validator lookup
    // must not recursively inject NgControl while constructing this component.
    this.ngControl = this.injector.get(NgControl, null, { self: true });
  }

  ngDoCheck(): void {
    const control = this.ngControl?.control ?? null;
    if (control === this.observedControl) return;
    this.controlEvents?.unsubscribe();
    this.observedControl = control;
    this.controlEvents = control?.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.changeDetector.markForCheck());
  }

  protected get effectiveRequired(): boolean {
    return (
      this.required() === true ||
      !!this.ngControl?.control?.hasValidator(Validators.required)
    );
  }

  writeValue(value: ForgeInputValue): void {
    this.text.set(value ?? '');
    // A reset can happen before the preceding input event renders. Always
    // write the native value even when Angular's previous binding is equal.
    const native = this.nativeInput()?.nativeElement;
    if (native) native.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.required() === true ? Validators.required(control) : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  protected handleInput(event: Event): void {
    if (this.disabled() || this.readonly()) return;
    const value = (event.target as HTMLInputElement).value;
    this.text.set(value);
    this.onChange(value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
