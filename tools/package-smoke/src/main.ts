import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ForgeButton } from '@forge-layer/angular';
import type {
  ForgeButtonColor,
  ForgeButtonIconPosition,
  ForgeButtonSize,
  ForgeButtonType,
  ForgeButtonVariant,
} from '@forge-layer/angular';

@Component({
  selector: 'smoke-app',
  imports: [ForgeButton],
  template: `
    <forge-button
      [variant]="variant"
      [color]="color"
      [size]="size"
      [type]="type"
      icon="save"
      [iconPosition]="position"
      (click)="count = count + 1"
    >
      Save
    </forge-button>
    <output>{{ count }}</output>
    <forge-button variant="icon" icon="delete" aria-label="Delete" />
    <forge-button [loading]="true">Loading</forge-button>
  `,
})
class App {
  variant: ForgeButtonVariant = 'filled';
  color: ForgeButtonColor = 'primary';
  size: ForgeButtonSize = 'md';
  type: ForgeButtonType = 'button';
  position: ForgeButtonIconPosition = 'end';
  count = 0;
}

bootstrapApplication(App).catch(console.error);
