import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {
  MatButton,
  MatButtonAppearance,
  MatIconButton,
} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  ForgeButtonColor,
  ForgeButtonIconPosition,
  ForgeButtonSize,
  ForgeButtonType,
  ForgeButtonVariant,
} from './button.types';

/**
 * Diameter of the loading spinner per size preset. The spinner needs a concrete
 * number to build its SVG viewBox, so it cannot be driven from CSS alone.
 */
const SPINNER_DIAMETER: Record<ForgeButtonSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

/**
 * A native `<button>` built on top of Angular Material, adding size presets,
 * semantic colors, icon placement and a loading state.
 *
 * Clicks bubble from the inner `<button>`, so `(click)` works as usual:
 *
 * ```html
 * <forge-button variant="outlined" color="error" icon="delete" (click)="remove()">
 *   Delete
 * </forge-button>
 * ```
 */
@Component({
  selector: 'forge-button',
  imports: [MatButton, MatIconButton, MatIcon, MatProgressSpinner],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-color]': 'color()',
    '[attr.data-size]': 'size()',
    // Naming attributes belong on the inner <button>, which is the actual
    // widget; leaving copies on the host would expose a second, roleless label.
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
  },
})
export class ForgeButton {
  /** Visual treatment. `icon` renders a Material icon button. */
  readonly variant = input<ForgeButtonVariant>('filled');

  /** Semantic color role, independent of the visual treatment. */
  readonly color = input<ForgeButtonColor>('primary');

  /** Size preset driving height, padding, typography, icon size and spacing. */
  readonly size = input<ForgeButtonSize>('md');

  /** Shows a spinner and blocks interaction while keeping the layout stable. */
  readonly loading = input(false);

  /** Disables the button. Also implied by {@link loading}. */
  readonly disabled = input(false);

  /** Material Icons ligature name, e.g. `save`. Required for `variant="icon"`. */
  readonly icon = input<string>();

  /** Icon placement. Has no effect when `variant="icon"`. */
  readonly iconPosition = input<ForgeButtonIconPosition>('start');

  /** Native `type` of the underlying `<button>`. */
  readonly type = input<ForgeButtonType>('button');

  /** Accessible name, forwarded to the inner `<button>`. */
  readonly ariaLabel = input<string | undefined>(undefined, {
    alias: 'aria-label',
  });

  /** Accessible name reference, forwarded to the inner `<button>`. */
  readonly ariaLabelledby = input<string | undefined>(undefined, {
    alias: 'aria-labelledby',
  });

  /** Effective disabled state: explicitly disabled, or busy loading. */
  readonly isDisabled = computed(() => this.disabled() || this.loading());

  /** Whether to render the icon-only Material button. */
  readonly isIconOnly = computed(() => this.variant() === 'icon');

  /**
   * Material appearance for every non-icon variant. `icon` never reaches the
   * `matButton` branch of the template, so it falls back to the Material default.
   */
  readonly appearance = computed<MatButtonAppearance>(() => {
    const variant = this.variant();
    return variant === 'icon' ? 'text' : variant;
  });

  /** Icon name rendered before the content, if any. */
  readonly startIcon = computed(() =>
    this.iconPosition() === 'start' ? this.icon() : undefined,
  );

  /** Icon name rendered after the content, if any. */
  readonly endIcon = computed(() =>
    this.iconPosition() === 'end' ? this.icon() : undefined,
  );

  /** Spinner diameter matching the current size preset. */
  readonly spinnerDiameter = computed(() => SPINNER_DIAMETER[this.size()]);
}
