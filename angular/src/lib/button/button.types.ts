/**
 * Visual treatment of a `ForgeButton`.
 *
 * Every value except `icon` maps onto an Angular Material button appearance;
 * `icon` renders a dedicated Material icon button instead.
 */
export type ForgeButtonVariant =
  | 'text'
  | 'elevated'
  | 'outlined'
  | 'filled'
  | 'tonal'
  | 'icon';

/** Semantic color role of a `ForgeButton`, resolved from the Material 3 theme. */
export type ForgeButtonColor = 'primary' | 'secondary' | 'tertiary' | 'error';

/** Size preset of a `ForgeButton`. */
export type ForgeButtonSize = 'sm' | 'md' | 'lg';

/** Placement of the icon relative to the projected content. */
export type ForgeButtonIconPosition = 'start' | 'end';

/** Native `type` attribute of the underlying `<button>` element. */
export type ForgeButtonType = 'button' | 'submit' | 'reset';
