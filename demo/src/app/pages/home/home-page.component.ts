import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-home-page', imports: [MatButtonModule, RouterLink], templateUrl: './home-page.component.html', styleUrl: './home-page.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class HomePageComponent {}
