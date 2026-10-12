import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { expect, userEvent, within } from 'storybook/test';
import { ForgeInput } from './input';
import type { ForgeInputType } from './input.types';

type InputArgs = {
  label: string;
  type: ForgeInputType;
  placeholder: string;
  hint: string;
  readonly: boolean;
  required: boolean;
  disabled: boolean;
  initialValue: string;
  name: string;
  autocomplete: string;
};

const meta = {
  title: 'Components/Input',
  decorators: [moduleMetadata({ imports: [ForgeInput, ReactiveFormsModule] })],
  args: { label: 'Name', type: 'text', placeholder: 'Enter a value', hint: '', readonly: false, required: false, disabled: false, initialValue: '', name: '', autocomplete: '' },
  argTypes: {
    label: { control: 'text' },
    type: { control: 'select', options: ['text', 'email', 'password'] },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean', description: 'Story helper: sets the FormControl disabled state, not a component input.' },
    initialValue: { control: 'text', description: 'Story helper: initial FormControl value.' },
    name: { control: 'text' },
    autocomplete: { control: 'text' },
  },
  render: (args) => ({
    props: { ...args, control: new FormControl({ value: args.initialValue, disabled: args.disabled }) },
    template: `<div style="width: 320px; max-width: 100%">
      <forge-input [label]="label" [type]="type" [placeholder]="placeholder" [hint]="hint"
        [readonly]="readonly" [required]="required" [name]="name" [autocomplete]="autocomplete" [formControl]="control" />
    </div>`,
  }),
} satisfies Meta<InputArgs>;

export default meta;
type Story = StoryObj<InputArgs>;

export const Playground: Story = {};
export const WithHint: Story = { args: { hint: 'Use your full name.' } };
export const Email: Story = { args: { label: 'Email', type: 'email', placeholder: 'jane@example.com', autocomplete: 'email' } };
export const Password: Story = { args: { label: 'Password', type: 'password', initialValue: 'secret-password', autocomplete: 'new-password' } };
export const Required: Story = {
  args: { required: true },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('textbox', { name: /Name/ })).toBeRequired(); },
};
export const Readonly: Story = {
  args: { readonly: true, initialValue: 'Copy this value' },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('textbox', { name: 'Name' })).toHaveAttribute('readonly'); },
};
export const Disabled: Story = {
  args: { disabled: true, initialValue: 'Unavailable' },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('textbox', { name: 'Name' })).toBeDisabled(); },
};
export const ReactiveForms: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>(null, [Validators.required, Validators.email]) },
    template: `<div style="width: 320px; max-width: 100%">
      <forge-input label="Email" type="email" autocomplete="email" hint="Required, valid email address" [formControl]="control" />
      <p role="status">Value: {{ control.value === null ? 'null' : control.value }} · Status: {{ control.status }}</p>
      <button type="button" (click)="control.reset()">Reset</button>
    </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: /Email/ });
    await userEvent.type(input, 'jane@example.com');
    await userEvent.tab();
    await expect(canvas.getByRole('status')).toHaveTextContent('Status: VALID');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(input).toHaveValue('');
    await expect(canvas.getByRole('status')).toHaveTextContent('Value: null · Status: INVALID');
  },
};
