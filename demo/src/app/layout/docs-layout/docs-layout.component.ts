import { ChangeDetectionStrategy, Component, HostListener, ViewChild, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DOCS_NAVIGATION } from './docs-navigation';
@Component({ selector: 'app-docs-layout', imports: [MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule, RouterLink, RouterLinkActive, RouterOutlet], templateUrl: './docs-layout.component.html', styleUrl: './docs-layout.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class DocsLayoutComponent {
  @ViewChild('sidenav') private readonly sidenav?: MatSidenav;
  readonly navigation = DOCS_NAVIGATION;
  readonly isMobile = signal(window.innerWidth < 768);
  @HostListener('window:resize') updateViewport(): void { this.isMobile.set(window.innerWidth < 768); }
  closeOnMobile(): void { if (this.isMobile()) this.sidenav?.close(); }
}
