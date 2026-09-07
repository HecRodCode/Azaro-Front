  // Título pixel-art. `level` controla la jerarquía semántica (h1..h3) y el
// tamaño. `tone` cambia el color sin duplicar el componente.

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PixelHeadingLevel = 1 | 2 | 3;
export type PixelHeadingTone = 'default' | 'accent' | 'hot' | 'dim';

@Component({
  selector: 'az-pixel-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (level()) {
      @case (1) {
        <h1 [attr.data-tone]="tone()"><ng-content /></h1>
      }
      @case (2) {
        <h2 [attr.data-tone]="tone()"><ng-content /></h2>
      }
      @default {
        <h3 [attr.data-tone]="tone()"><ng-content /></h3>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      h1,
      h2,
      h3 {
        margin: 0;
        letter-spacing: 0.15em;
        text-shadow: 3px 3px 0 var(--color-crt-shadow);
        color: var(--color-crt-ink);
      }
      h1 {
        font-size: 32px;
      }
      h2 {
        font-size: 14px;
      }
      h3 {
        font-size: 11px;
      }
      [data-tone='accent'] {
        color: var(--color-crt-accent);
      }
      [data-tone='hot'] {
        color: var(--color-crt-accent-hot);
      }
      [data-tone='dim'] {
        color: var(--color-crt-ink-dim);
        text-shadow: none;
      }
    `,
  ],
})
export class PixelHeading {
  readonly level = input<PixelHeadingLevel>(2);
  readonly tone = input<PixelHeadingTone>('default');
}
