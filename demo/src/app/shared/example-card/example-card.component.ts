import { DOCUMENT } from '@angular/common';
import { afterRenderEffect, ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-example-card',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './example-card.component.html',
  styleUrl: './example-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleCardComponent {
  private readonly document = inject(DOCUMENT);
  private readonly fragment = toSignal(inject(ActivatedRoute).fragment);
  readonly exampleId = input.required<string>();
  readonly title = input.required<string>();
  readonly code = input.required<string>();
  readonly codeVisible = signal(false);
  readonly status = signal('');

  constructor() {
    afterRenderEffect(() => {
      if (this.fragment() === this.exampleId()) {
        // The documentation scrolls inside Material's sidenav content.
        this.document.getElementById(this.exampleId())?.scrollIntoView({ block: 'start' });
      }
    });
  }

  toggleCode(): void {
    this.codeVisible.update(visible => !visible);
    this.status.set('');
  }

  async copyCode(): Promise<void> {
    await this.copy(this.code(), 'Code copied');
  }

  async copyLink(): Promise<void> {
    const url = new URL(this.document.location.href);
    url.hash = this.exampleId();
    await this.copy(url.href, 'Link copied');
  }

  private async copy(text: string, success: string): Promise<void> {
    try {
      const clipboard = this.document.defaultView?.navigator.clipboard;
      if (!clipboard) throw new Error('Clipboard unavailable');
      await clipboard.writeText(text);
      this.status.set(success);
    } catch {
      this.status.set('Unable to copy to clipboard. Please try again.');
    }
  }
}
