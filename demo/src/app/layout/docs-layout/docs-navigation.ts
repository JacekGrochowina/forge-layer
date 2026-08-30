export interface DocsNavigationItem { label: string; route: string; icon?: string; }
export interface DocsNavigationGroup { label?: string; items: DocsNavigationItem[]; }
export const DOCS_NAVIGATION: DocsNavigationGroup[] = [
  { items: [{ label: 'Introduction', route: '/', icon: 'home' }] },
  { label: 'Components', items: [{ label: 'Button', route: '/components/button', icon: 'smart_button' }] },
];
