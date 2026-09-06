// Botón base con estética pixel-art (borde duro escalonado, hover invertido).
// Se parametriza vía `variant` para no duplicar variantes en cada pantalla.
// Ver components/catalog.md antes de crear otro botón.

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PixelButtonVariant = 'primary' | 'ghost' | 'danger';

@Component({
  selector: 'az-pixel-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button [type]="type()" [disabled]="disabled()" [class]="classes()">
      <ng-content />
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      button {
        font-family: var(--font-pixel);
        font-size: 10px;
        padding: 10px 16px;
        border: 3px solid var(--color-crt-ink);
        background: var(--color-crt-bg-alt);
        color: var(--color-crt-ink);
        box-shadow:
          4px 0 0 var(--color-crt-shadow),
          0 4px 0 var(--color-crt-shadow),
          4px 4px 0 var(--color-crt-shadow);
        transition: none;
      }
      button:hover:not(:disabled) {
        background: var(--color-crt-ink);
        color: var(--color-crt-bg);
      }
      button:active:not(:disabled) {
        transform: translate(2px, 2px);
        box-shadow:
          2px 0 0 var(--color-crt-shadow),
          0 2px 0 var(--color-crt-shadow),
          2px 2px 0 var(--color-crt-shadow);
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .primary {
        border-color: var(--color-crt-accent);
        color: var(--color-crt-accent);
      }
      .primary:hover:not(:disabled) {
        background: var(--color-crt-accent);
        color: var(--color-crt-bg);
      }
      .danger {
        border-color: var(--color-crt-danger);
        color: var(--color-crt-danger);
      }
      .danger:hover:not(:disabled) {
        background: var(--color-crt-danger);
        color: var(--color-crt-bg);
      }
    `,
  ],
})
export class PixelButton {
  readonly variant = input<PixelButtonVariant>('primary');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input<boolean>(false);

  protected readonly classes = () => this.variant();
}
