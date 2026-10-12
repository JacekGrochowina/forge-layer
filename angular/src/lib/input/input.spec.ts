import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ForgeInput } from './input';

@Component({
  imports: [ReactiveFormsModule, ForgeInput],
  template: `<form [formGroup]="form">
    @if (named) {
      <forge-input
        label="Email"
        formControlName="email"
        [required]="required() ?? false"
        [readonly]="readonly()"
        hint="Kontakt"
        [id]="id()"
        name="email"
        autocomplete="email"
        type="email"
        placeholder="Adres"
      />
    } @else {
      <forge-input
        label="Email"
        [formControl]="control"
        [required]="required() ?? false"
        [readonly]="readonly()"
        hint="Kontakt"
        [id]="id()"
        name="email"
        autocomplete="email"
        type="email"
        placeholder="Adres"
      />
    }
    <forge-input label="Drugie" [formControl]="other" />
  </form>`,
})
class Host {
  named = false;
  control = new FormControl<string | null>(null);
  other = new FormControl('');
  form = new FormGroup({ email: this.control, other: this.other });
  required = signal<boolean | undefined>(undefined);
  readonly = signal(false);
  id = signal<string | undefined>(undefined);
}

for (const named of [false, true]) {
  describe(`ForgeInput ${named ? 'formControlName' : 'formControl'}`, () => {
    const setup = async (
      updateOn: 'change' | 'blur' | 'submit' = 'change',
      nonNullable = false,
    ) => {
      await TestBed.configureTestingModule({
        imports: [Host],
      }).compileComponents();
      const fixture = TestBed.createComponent(Host);
      const host = fixture.componentInstance;
      host.named = named;
      host.control = nonNullable
        ? new FormControl('Anna', { nonNullable: true, updateOn })
        : new FormControl<string | null>(null, { updateOn });
      host.form = new FormGroup({ email: host.control, other: host.other });
      await fixture.whenStable();
      const native = fixture.nativeElement.querySelector(
        'input',
      ) as HTMLInputElement;
      const component = fixture.debugElement.query(
        (node) => node.componentInstance instanceof ForgeInput,
      ).componentInstance as ForgeInput;
      const edit = (value: string) => {
        native.value = value;
        native.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const blur = () => native.dispatchEvent(new Event('blur'));
      const submit = () =>
        fixture.nativeElement
          .querySelector('form')
          .dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true }),
          );
      const directive = fixture.debugElement
        .query((node) => !!node.injector.get(FormGroupDirective, null))
        .injector.get(FormGroupDirective);
      return {
        fixture,
        host,
        native,
        component,
        edit,
        blur,
        submit,
        directive,
      };
    };

    it('FL-10a: forwards presentation attributes, associates labels/hints and keeps distinct stable IDs', async () => {
      const { fixture, host, native } = await setup();
      const id = native.id;
      expect(id).toBeTruthy();
      expect(fixture.nativeElement.querySelectorAll('input')[1].id).not.toBe(
        id,
      );
      expect(
        fixture.nativeElement.querySelector('label').getAttribute('for'),
      ).toBe(id);
      expect(
        fixture.nativeElement.querySelector(
          `#${native.getAttribute('aria-describedby')}`,
        ).textContent,
      ).toContain('Kontakt');
      expect(native.type).toBe('email');
      expect(native.name).toBe('email');
      expect(native.autocomplete).toBe('email');
      expect(native.placeholder).toBe('Adres');
      host.control.setValue('Anna');
      await fixture.whenStable();
      expect(native.id).toBe(id);
      host.id.set('custom-email');
      await fixture.whenStable();
      expect(native.id).toBe('custom-email');
      expect(
        fixture.nativeElement.querySelector('forge-input').hasAttribute('id'),
      ).toBe(false);
    });

    it('V01/V05/V06/V14: maps null to empty and reports one unchanged string per user edit', async () => {
      const { fixture, host, native, edit, blur } = await setup();
      expect(native.value).toBe('');
      expect(host.control.value).toBeNull();
      const changes: unknown[] = [];
      host.control.valueChanges.subscribe((value) => changes.push(value));
      native.type = 'text';
      edit(' AbC ');
      expect(host.control.value).toBe(' AbC ');
      edit('');
      expect(changes).toEqual([' AbC ', '']);
      expect(host.control.touched).toBe(false);
      blur();
      expect(host.control.touched).toBe(true);
      host.control.patchValue(null);
      await fixture.whenStable();
      expect(native.value).toBe('');
      expect(changes).toEqual([' AbC ', '', null]);
    });

    it('programmatic writes call neither CVA callback; blur touches once', async () => {
      const { fixture, component, native, blur } = await setup();
      const change = vi.fn();
      const touch = vi.fn();
      component.registerOnChange(change);
      component.registerOnTouched(touch);
      component.writeValue('Anna');
      component.writeValue(null);
      component.setDisabledState(true);
      await fixture.whenStable();
      expect(native.value).toBe('');
      expect(change).not.toHaveBeenCalled();
      expect(touch).not.toHaveBeenCalled();
      component.setDisabledState(false);
      blur();
      expect(touch).toHaveBeenCalledTimes(1);
    });

    it('T12–T17: preserves nullable/nonnullable reset and parent submitted semantics', async () => {
      const { fixture, host, native, edit, blur, submit, directive } =
        await setup();
      edit('Anna');
      blur();
      submit();
      host.control.reset();
      await fixture.whenStable();
      expect(host.control.value).toBeNull();
      expect(native.value).toBe('');
      expect(host.control.pristine && host.control.untouched).toBe(true);
      expect(directive.submitted).toBe(true);
      directive.resetForm({ email: 'bad' });
      await fixture.whenStable();
      expect(native.value).toBe('bad');
      expect(directive.submitted).toBe(false);
    });

    it('T15: nonnullable reset restores the initial value', async () => {
      const { fixture, host, native, edit } = await setup('change', true);
      edit('Other');
      host.control.reset();
      await fixture.whenStable();
      expect(native.value).toBe('Anna');
      expect(host.control.value).toBe('Anna');
    });

    for (const updateOn of ['blur', 'submit'] as const) {
      it(`T20–T22: respects updateOn=${updateOn}`, async () => {
        const { fixture, host, native, edit, blur, submit } =
          await setup(updateOn);
        host.control.addValidators(Validators.required);
        host.control.updateValueAndValidity();
        edit('Anna');
        expect(native.value).toBe('Anna');
        expect(host.control.value).toBeNull();
        blur();
        if (updateOn === 'submit') {
          expect(host.control.value).toBeNull();
          submit();
        }
        await fixture.whenStable();
        expect(host.control.value).toBe('Anna');
        expect(host.control.valid).toBe(true);
        edit('');
        blur();
        if (updateOn === 'submit') submit();
        expect(host.control.value).toBe('');
        expect(host.control.hasError('required')).toBe(true);
      });
    }

    it('R01–R09/R11/R13: toggles Forge required and detects changing parent validators', async () => {
      const { fixture, host, native } = await setup();
      expect(native.required).toBe(false);
      host.required.set(true);
      await fixture.whenStable();
      expect(host.control.hasError('required')).toBe(true);
      expect(native.required).toBe(true);
      expect(native.getAttribute('aria-required')).toBe('true');
      expect(host.control.untouched).toBe(true);
      host.control.addValidators(Validators.required);
      host.control.updateValueAndValidity();
      host.required.set(false);
      await fixture.whenStable();
      expect(native.required).toBe(true);
      expect(host.control.hasError('required')).toBe(true);
      host.control.removeValidators(Validators.required);
      host.control.updateValueAndValidity();
      await fixture.whenStable();
      expect(native.required).toBe(false);
      expect(host.control.valid).toBe(true);
      host.control.addValidators(Validators.email);
      host.control.setValue('bad');
      host.required.set(true);
      await fixture.whenStable();
      host.required.set(undefined);
      await fixture.whenStable();
      expect(host.control.errors).toEqual({ email: true });
      expect(native.required).toBe(false);
    });

    it('R10/R12: supports composed required and changes while disabled', async () => {
      const { fixture, host, native } = await setup();
      host.control.setValidators(
        Validators.compose([Validators.required, Validators.email]),
      );
      host.control.disable();
      host.required.set(true);
      await fixture.whenStable();
      expect(native.required).toBe(true);
      expect(host.control.status).toBe('DISABLED');
      host.control.enable();
      await fixture.whenStable();
      expect(host.control.hasError('required')).toBe(true);
    });

    it('T01–T08: readonly retains validation/value; disabled excludes it and rejects input events', async () => {
      const { fixture, host, native, edit } = await setup();
      host.control.setValue('Anna');
      host.control.addValidators(Validators.required);
      host.control.updateValueAndValidity();
      host.readonly.set(true);
      await fixture.whenStable();
      expect(native.readOnly).toBe(true);
      expect(native.disabled).toBe(false);
      native.focus();
      expect(document.activeElement).toBe(native);
      native.type = 'text';
      native.select();
      expect(native.selectionEnd).toBe(4);
      edit('Ignored');
      expect(host.control.value).toBe('Anna');
      expect(host.form.value).toEqual({ email: 'Anna', other: '' });
      host.readonly.set(false);
      host.control.disable();
      await fixture.whenStable();
      expect(native.disabled).toBe(true);
      edit('Ignored');
      expect(host.control.value).toBe('Anna');
      expect(host.form.value).toEqual({ other: '' });
      expect(host.form.getRawValue()).toEqual({ email: 'Anna', other: '' });
      host.control.enable();
      await fixture.whenStable();
      expect(native.disabled).toBe(false);
    });
  });
}
