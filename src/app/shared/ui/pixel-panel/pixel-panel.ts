// Panel base pixel-art: borde duro + sombra escalonada estilo diálogo GBA.
// Usa slots vía ng-content: header opcional (`slot="header"`) y cuerpo.
// Se parametriza con `tone` para variantes semánticas sin duplicar estilos.

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PixelPanelTone = 'default' | 'accent' | 'danger';

@Component({
  selector: 'az-pixel-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section [attr.data-tone]="tone()">
      <ng-content select="[slot=header]" />
      <div class="body">
        <ng-content />
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      section {
        border: 3px solid var(--color-crt-border);
        background: var(--color-crt-bg-alt);
        padding: 20px;
        box-shadow: 6px 6px 0 var(--color-crt-shadow);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      section[data-tone='accent'] {
        border-color: var(--color-crt-accent);
      }
      section[data-tone='danger'] {
        border-color: var(--color-crt-danger);
      }
      .body {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
    `,
  ],
})
export class PixelPanel {
  readonly tone = input<PixelPanelTone>('default');
}
