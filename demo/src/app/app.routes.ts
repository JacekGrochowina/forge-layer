import { Route } from '@angular/router';
import { DocsLayoutComponent } from './layout/docs-layout/docs-layout.component';
import { ButtonPageComponent } from './pages/button/button-page.component';
import { HomePageComponent } from './pages/home/home-page.component';

export const appRoutes: Route[] = [{ path: '', component: DocsLayoutComponent, children: [
  { path: '', pathMatch: 'full', component: HomePageComponent, title: 'Forge Layer' },
  { path: 'components/button', component: ButtonPageComponent, title: 'Button | Forge Layer' },
] }, { path: '**', redirectTo: '' }];
