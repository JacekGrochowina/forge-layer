import { ChangeDetectionStrategy, Component, input } from '@angular/core';
export interface ApiProperty { property: string; type: string; default: string; description: string; }
@Component({ selector: 'app-api-table', templateUrl: './api-table.component.html', styleUrl: './api-table.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ApiTableComponent { readonly properties = input.required<ApiProperty[]>(); }
