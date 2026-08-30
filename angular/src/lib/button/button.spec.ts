import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgeButton } from './button';
import {
  ForgeButtonColor,
  ForgeButtonIconPosition,
  ForgeButtonSize,
  ForgeButtonType,
  ForgeButtonVariant,
} from './button.types';

@Component({
  imports: [ForgeButton],
  template: `
    <forge-button
      [variant]="variant()"
      [color]="color()"
      [size]="size()"
      [icon]="icon()"
      [iconPosition]="iconPosition()"
      [loading]="loading()"
      [disabled]="disabled()"
      [type]="type()"
      [aria-label]="ariaLabel()"
      (click)="clicks.set(clicks() + 1)"
    >
      Save changes
    </forge-button>
  `,
})
class TestHost {
  readonly variant = signal<ForgeButtonVariant>('filled');
  readonly color = signal<ForgeButtonColor>('primary');
  readonly size = signal<ForgeButtonSize>('md');
  readonly icon = signal<string | undefined>(undefined);
  readonly iconPosition = signal<ForgeButtonIconPosition>('start');
  readonly loading = signal(false);
  readonly disabled = signal(false);
  readonly type = signal<ForgeButtonType>('button');
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly clicks = signal(0);
}

describe('ForgeButton', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  /** The `<forge-button>` element itself. */
  const hostElement = (): HTMLElement =>
    fixture.nativeElement.querySelector('forge-button');

  /** The native `<button>` rendered inside the component. */
  const button = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button');

  /** Icons in DOM order, as rendered inside the button. */
  const icons = (): HTMLElement[] =>
    Array.from(button().querySelectorAll('mat-icon'));

  /** Re-render after mutating host signals. */
  const settle = async () => {
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    await settle();
  });

  it('should create', () => {
    expect(button()).toBeTruthy();
  });

  describe('defaults', () => {
    it('defaults to the filled variant', () => {
      expect(hostElement().getAttribute('data-variant')).toBe('filled');
      // Material's class for the filled appearance.
      expect(button().classList).toContain('mat-mdc-unelevated-button');
    });

    it('defaults to the primary color', () => {
      expect(hostElement().getAttribute('data-color')).toBe('primary');
    });

    it('defaults to the md size', () => {
      expect(hostElement().getAttribute('data-size')).toBe('md');
    });

    it('defaults to type="button" so it does not submit forms implicitly', () => {
      expect(button().type).toBe('button');
    });
  });

  describe('variants', () => {
    const cases: [ForgeButtonVariant, string][] = [
      ['text', 'mat-mdc-button'],
      ['elevated', 'mat-mdc-raised-button'],
      ['outlined', 'mat-mdc-outlined-button'],
      ['filled', 'mat-mdc-unelevated-button'],
      ['tonal', 'mat-tonal-button'],
      ['icon', 'mat-mdc-icon-button'],
    ];

    for (const [variant, expectedClass] of cases) {
      it(`applies the Material treatment for "${variant}"`, async () => {
        host.variant.set(variant);
        await settle();

        expect(hostElement().getAttribute('data-variant')).toBe(variant);
        expect(button().classList).toContain(expectedClass);
      });
    }

    it('keeps variant and color independent', async () => {
      host.variant.set('outlined');
      host.color.set('error');
      await settle();

      expect(button().classList).toContain('mat-mdc-outlined-button');
      expect(hostElement().getAttribute('data-color')).toBe('error');
    });
  });

  describe('sizes', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`exposes "${size}" for the stylesheet`, async () => {
        host.size.set(size);
        await settle();

        expect(hostElement().getAttribute('data-size')).toBe(size);
      });
    }
  });

  describe('disabled', () => {
    it('disables the native button rather than only styling it', async () => {
      host.disabled.set(true);
      await settle();

      expect(button().disabled).toBe(true);
      expect(button().hasAttribute('disabled')).toBe(true);
    });

    it('is enabled by default', () => {
      expect(button().disabled).toBe(false);
    });

    it('does not emit clicks while disabled', async () => {
      host.disabled.set(true);
      await settle();

      button().click();

      expect(host.clicks()).toBe(0);
    });
  });

  describe('loading', () => {
    it('renders a spinner', async () => {
      host.loading.set(true);
      await settle();

      expect(button().querySelector('mat-spinner')).toBeTruthy();
    });

    it('has no spinner when not loading', () => {
      expect(button().querySelector('mat-spinner')).toBeNull();
    });

    it('makes the button effectively disabled', async () => {
      host.loading.set(true);
      await settle();

      expect(button().disabled).toBe(true);
    });

    it('keeps the projected content mounted so the layout is preserved', async () => {
      host.loading.set(true);
      await settle();

      expect(button().textContent).toContain('Save changes');
      // Material hides the label visually while keeping it in flow.
      expect(button().classList).toContain(
        'mat-mdc-button-progress-indicator-shown',
      );
    });

    it('stays disabled even when disabled is explicitly false', async () => {
      host.disabled.set(false);
      host.loading.set(true);
      await settle();

      expect(button().disabled).toBe(true);
    });
  });

  describe('icons', () => {
    it('renders no icon by default', () => {
      expect(icons()).toHaveLength(0);
    });

    it('renders the Material icon ligature', async () => {
      host.icon.set('save');
      await settle();

      expect(icons()).toHaveLength(1);
      expect(icons()[0].textContent?.trim()).toBe('save');
    });

    it('places a start icon before the label', async () => {
      host.icon.set('save');
      host.iconPosition.set('start');
      await settle();

      const icon = icons()[0];
      expect(icon.hasAttribute('iconPositionEnd')).toBe(false);
      expect(
        icon.compareDocumentPosition(
          button().querySelector('.mdc-button__label') as Element,
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it('places an end icon after the label', async () => {
      host.icon.set('save');
      host.iconPosition.set('end');
      await settle();

      const icon = icons()[0];
      expect(icon.hasAttribute('iconPositionEnd')).toBe(true);
      expect(
        icon.compareDocumentPosition(
          button().querySelector('.mdc-button__label') as Element,
        ) & Node.DOCUMENT_POSITION_PRECEDING,
      ).toBeTruthy();
    });

    it('renders only the icon for variant="icon"', async () => {
      host.variant.set('icon');
      host.icon.set('delete');
      await settle();

      expect(button().classList).toContain('mat-mdc-icon-button');
      expect(icons()).toHaveLength(1);
      expect(icons()[0].textContent?.trim()).toBe('delete');
      // Projected text is not shown as a normal label.
      expect(button().textContent).not.toContain('Save changes');
    });

    it('ignores iconPosition for variant="icon"', async () => {
      host.variant.set('icon');
      host.icon.set('delete');
      host.iconPosition.set('end');
      await settle();

      expect(icons()).toHaveLength(1);
      expect(icons()[0].hasAttribute('iconPositionEnd')).toBe(false);
    });

    it('does not switch variant just because an icon was provided', async () => {
      host.icon.set('save');
      await settle();

      expect(hostElement().getAttribute('data-variant')).toBe('filled');
      expect(button().classList).not.toContain('mat-mdc-icon-button');
    });
  });

  describe('type', () => {
    for (const type of ['button', 'submit', 'reset'] as const) {
      it(`binds type="${type}"`, async () => {
        host.type.set(type);
        await settle();

        expect(button().type).toBe(type);
      });
    }
  });

  describe('content projection', () => {
    it('projects the content as the button label', () => {
      expect(button().textContent).toContain('Save changes');
    });

    it('re-projects content when switching away from and back to icon', async () => {
      host.variant.set('icon');
      await settle();
      expect(button().textContent).not.toContain('Save changes');

      host.variant.set('filled');
      await settle();
      expect(button().textContent).toContain('Save changes');
    });
  });

  describe('accessibility', () => {
    it('renders a real native button element', () => {
      expect(button().tagName).toBe('BUTTON');
    });

    it('forwards aria-label to the inner button', async () => {
      host.variant.set('icon');
      host.icon.set('delete');
      host.ariaLabel.set('Delete');
      await settle();

      expect(button().getAttribute('aria-label')).toBe('Delete');
    });

    it('does not leave a duplicate aria-label on the host element', async () => {
      host.ariaLabel.set('Delete');
      await settle();

      expect(hostElement().hasAttribute('aria-label')).toBe(false);
    });

    it('exposes the disabled state to assistive technology', async () => {
      host.disabled.set(true);
      await settle();

      expect(button().hasAttribute('disabled')).toBe(true);
    });

    it('lets native click events bubble to the host', () => {
      button().click();

      expect(host.clicks()).toBe(1);
    });
  });
});
