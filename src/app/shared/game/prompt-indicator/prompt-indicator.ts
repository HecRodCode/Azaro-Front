// Prompt "▼ presiona X" que se ancla sobre una zona interactiva del canvas.
// Se posiciona en pantalla proyectando el ancla NDC (-1..1, Y up) que la
// escena publica al WorldStore contra el viewport actual. Independiente
// del canvas y de cualquier lógica de juego; solo pinta y anima.

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface AnchorNdc {
  x: number;
  y: number;
}

@Component({
  selector: 'az-prompt-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible() && anchorNdc(); as ndc) {
      <div class="prompt" [style.left.px]="screenX()" [style.top.px]="screenY()">
        <div class="chip">{{ label() }}</div>
        <div class="arrow">▼</div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .prompt {
        position: fixed;
        transform: translate(-50%, -100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        pointer-events: none;
        animation: az-prompt-blink 0.7s steps(2, end) infinite;
      }
      .chip {
        font-family: var(--font-pixel);
        font-size: 10px;
        padding: 4px 8px;
        background: var(--color-crt-bg-alt);
        border: 2px solid var(--color-crt-accent);
        color: var(--color-crt-accent);
        box-shadow: 3px 3px 0 var(--color-crt-shadow);
      }
      .arrow {
        font-family: var(--font-pixel);
        font-size: 14px;
        line-height: 1;
        color: var(--color-crt-accent);
        text-shadow: 2px 2px 0 var(--color-crt-shadow);
      }
      @keyframes az-prompt-blink {
        50% {
          opacity: 0.35;
        }
      }
    `,
  ],
})
export class PromptIndicator {
  readonly visible = input<boolean>(false);
  readonly anchorNdc = input<AnchorNdc | null>(null);
  readonly label = input<string>('E');

  protected readonly screenX = computed(() => {
    const ndc = this.anchorNdc();
    if (!ndc) return 0;
    return ((ndc.x + 1) / 2) * window.innerWidth;
  });

  protected readonly screenY = computed(() => {
    const ndc = this.anchorNdc();
    if (!ndc) return 0;
    return (1 - (ndc.y + 1) / 2) * window.innerHeight;
  });
}
