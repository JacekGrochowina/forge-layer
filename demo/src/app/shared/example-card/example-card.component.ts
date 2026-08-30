import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({ selector: 'app-example-card', templateUrl: './example-card.component.html', styleUrl: './example-card.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ExampleCardComponent { readonly title = input.required<string>(); readonly code = input.required<string>(); }
