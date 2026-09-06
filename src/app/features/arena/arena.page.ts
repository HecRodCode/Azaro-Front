// Host de la arena 3D. La escena de Three.js se construye en ./three/
// (aún no implementada). Este archivo NO conoce Three.js.

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'az-arena',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="screen">
      <p class="tag">ARENA</p>
      <p class="code">SALA: {{ code() }}</p>
      <p class="hint">-- escena three.js pendiente --</p>
    </main>
  `,
  styles: [
    `
      .screen {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        color: var(--color-crt-ink);
      }
      .tag {
        color: var(--color-crt-accent-hot);
      }
      .code {
        font-size: 20px;
        color: var(--color-crt-accent);
      }
      .hint {
        color: var(--color-crt-ink-dim);
      }
    `,
  ],
})
export class ArenaPage {
  readonly code = input<string>('');
}
