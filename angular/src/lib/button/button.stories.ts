import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ForgeButton } from './button';
import type {
  ForgeButtonColor,
  ForgeButtonIconPosition,
  ForgeButtonSize,
  ForgeButtonType,
  ForgeButtonVariant,
} from './button.types';

type ButtonArgs = {
  label: string;
  variant: ForgeButtonVariant;
  color: ForgeButtonColor;
  size: ForgeButtonSize;
  loading: boolean;
  disabled: boolean;
  icon: string;
  iconPosition: ForgeButtonIconPosition;
  type: ForgeButtonType;
  ariaLabel: string;
  ariaLabelledby: string;
  clicked: ReturnType<typeof fn>;
};

const meta = {
  title: 'Components/Button',
  component: ForgeButton,
  args: {
    label: 'Save changes',
    variant: 'filled',
    color: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    icon: '',
    iconPosition: 'start',
    type: 'button',
    ariaLabel: '',
    ariaLabelledby: '',
    clicked: fn(),
  },
  argTypes: {
    label: { control: 'text', description: 'Text projected into the button.' },
    variant: {
      control: 'select',
      options: ['text', 'elevated', 'outlined', 'filled', 'tonal', 'icon'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'error'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    icon: { control: 'text' },
    iconPosition: { control: 'radio', options: ['start', 'end'] },
    type: { control: 'select', options: ['button', 'submit', 'reset'] },
    ariaLabel: {
      control: 'text',
      description: 'aria-label input; forwarded to the native button.',
    },
    ariaLabelledby: {
      control: 'text',
      description: 'aria-labelledby input; ID of the naming element.',
    },
    clicked: { control: false, table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `<forge-button [variant]="variant" [color]="color" [size]="size"
      [loading]="loading" [disabled]="disabled" [icon]="icon"
      [iconPosition]="iconPosition" [type]="type"
      [aria-label]="ariaLabel || undefined" [aria-labelledby]="ariaLabelledby || undefined"
      (click)="clicked($event)">{{ label }}</forge-button>`,
  }),
} satisfies Meta<ButtonArgs>;

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Playground: Story = {};
export const WithIcon: Story = { args: { icon: 'save' } };
export const TrailingIcon: Story = {
  args: { icon: 'arrow_forward', iconPosition: 'end', label: 'Continue' },
};
export const IconOnly: Story = {
  args: { variant: 'icon', icon: 'delete', ariaLabel: 'Delete item' },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Save changes' }),
    ).toBeDisabled();
  },
};
export const Loading: Story = {
  args: { loading: true, icon: 'save' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Save changes' }),
    ).toBeDisabled();
  },
};
export const Variants: Story = {
  render: () => ({
    template: `<div class="forge-story-grid">
      <forge-button variant="text">Text</forge-button>
      <forge-button variant="elevated">Elevated</forge-button>
      <forge-button variant="outlined">Outlined</forge-button>
      <forge-button variant="filled">Filled</forge-button>
      <forge-button variant="tonal">Tonal</forge-button>
      <forge-button variant="icon" icon="favorite" aria-label="Add to favorites" />
    </div>`,
  }),
};
export const Colors: Story = {
  render: () => ({
    template: `<div class="forge-story-grid">
      <forge-button color="primary">Primary</forge-button>
      <forge-button color="secondary">Secondary</forge-button>
      <forge-button color="tertiary">Tertiary</forge-button>
      <forge-button color="error">Delete</forge-button>
    </div>`,
  }),
};
export const Sizes: Story = {
  render: () => ({
    template: `<div class="forge-story-grid">
      <forge-button size="sm">Small</forge-button>
      <forge-button size="md">Medium</forge-button>
      <forge-button size="lg">Large</forge-button>
    </div>`,
  }),
};
export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Save changes',
    });
    button.focus();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.clicked).toHaveBeenCalledTimes(2);
  },
};
