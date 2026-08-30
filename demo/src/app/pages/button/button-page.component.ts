import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ForgeButton, ForgeButtonColor, ForgeButtonIconPosition, ForgeButtonSize, ForgeButtonVariant } from '@forge-layer/angular';
import { ApiProperty, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ExampleCardComponent } from '../../shared/example-card/example-card.component';

@Component({ selector: 'app-button-page', imports: [ApiTableComponent, ExampleCardComponent, ForgeButton, MatFormFieldModule, MatSelectModule, MatSlideToggleModule], templateUrl: './button-page.component.html', styleUrl: './button-page.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ButtonPageComponent {
  readonly variant = signal<ForgeButtonVariant>('filled'); readonly color = signal<ForgeButtonColor>('primary'); readonly size = signal<ForgeButtonSize>('md'); readonly loading = signal(false); readonly disabled = signal(false); readonly icon = signal('save'); readonly iconPosition = signal<ForgeButtonIconPosition>('start'); readonly submitted = signal(false);
  readonly playgroundCode = computed(() => `<forge-button\n  variant="${this.variant()}"\n  color="${this.color()}"\n  size="${this.size()}"${this.icon() ? `\n  icon="${this.icon()}"\n  iconPosition="${this.iconPosition()}"` : ''}${this.loading() ? '\n  [loading]="true"' : ''}${this.disabled() ? '\n  [disabled]="true"' : ''}\n>\n  Save\n</forge-button>`);
  readonly api: ApiProperty[] = [
    { property: 'variant', type: "'text' | 'elevated' | 'outlined' | 'filled' | 'tonal' | 'icon'", default: "'filled'", description: 'Visual treatment. Icon renders an icon-only button.' },
    { property: 'color', type: "'primary' | 'secondary' | 'tertiary' | 'error'", default: "'primary'", description: 'Semantic Material color role.' },
    { property: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Button size preset.' },
    { property: 'loading', type: 'boolean', default: 'false', description: 'Shows a progress indicator and disables interaction.' },
    { property: 'disabled', type: 'boolean', default: 'false', description: 'Disables the native button.' },
    { property: 'icon', type: 'string', default: 'undefined', description: 'Material Icons ligature name.' },
    { property: 'iconPosition', type: "'start' | 'end'", default: "'start'", description: 'Icon placement for non-icon variants.' },
    { property: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", description: 'Native button type.' },
    { property: 'aria-label', type: 'string', default: 'undefined', description: 'Accessible name forwarded to the native button.' },
    { property: 'aria-labelledby', type: 'string', default: 'undefined', description: 'Accessible name reference forwarded to the native button.' },
  ];
  markSubmitted(): void { this.submitted.set(true); }
}
