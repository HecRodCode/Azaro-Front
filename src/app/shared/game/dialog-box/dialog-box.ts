// Caja de diálogo estilo Pokémon GBA. Marco duro doble + sombra escalonada,
// fondo semi-oscuro por atrás. No sabe qué muestra adentro: los features
// (TempleDialog, QuestionDialog) proyectan su contenido con ng-content.
// Se abre/cierra vía input `open`; emite (close) cuando se pulsa ESC o el
// backdrop (si `closeOnBackdrop`).

import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'az-dialog-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="backdrop" (click)="onBackdrop()">
        <div class="frame" role="dialog" (click)="$event.stopPropagation()">
          @if (title()) {
            <header>{{ title() }}</header>
          }
          <div class="body">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(4, 20, 10, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 500;
      }
      .frame {
        min-width: 320px;
        max-width: min(560px, 90vw);
        background: var(--color-crt-bg-alt);
        border: 3px solid var(--color-crt-accent);
        box-shadow:
          0 0 0 3px var(--color-crt-bg),
          0 0 0 6px var(--color-crt-accent),
          8px 8px 0 var(--color-crt-shadow);
        display: flex;
        flex-direction: column;
      }
      header {
        font-family: var(--font-pixel);
        font-size: 11px;
        color: var(--color-crt-accent-hot);
        padding: 10px 14px;
        border-bottom: 2px solid var(--color-crt-border);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .body {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
    `,
  ],
})
export class DialogBox {
  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly closeOnBackdrop = input<boolean>(true);
  readonly close = output<void>();

  @HostListener('window:keydown.escape')
  protected onEscape(): void {
    if (this.open()) this.close.emit();
  }

  protected onBackdrop(): void {
    if (this.closeOnBackdrop()) this.close.emit();
  }
}
