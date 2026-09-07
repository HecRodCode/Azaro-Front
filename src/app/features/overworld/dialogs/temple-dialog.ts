// Diálogo del templo: menú Crear/Unirse dentro del az-dialog-box. Reutiliza
// los primitivos pixel-* del barrel shared/ui. No habla con el backend: los
// resultados salen como eventos (create) / (join) para que la página los
// enrute cuando el RoomsService cliente exista.

import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogBox } from '../../../shared/game';
import { PixelButton, PixelHeading, PixelInput } from '../../../shared/ui';

type Mode = 'menu' | 'joinInput';

@Component({
  selector: 'az-temple-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogBox, PixelButton, PixelHeading, PixelInput, FormsModule],
  template: `
    <az-dialog-box [open]="open()" title="Templo de Azaro" (close)="cancel()">
      @if (mode() === 'menu') {
        <az-pixel-heading [level]="3" tone="accent">
          Elegí tu camino, piloto
        </az-pixel-heading>
        <p class="hint">Podés crear una sala nueva o unirte a una existente.</p>
        <div class="stack">
          <az-pixel-button variant="primary" (click)="onCreate()">
            Crear sala
          </az-pixel-button>
          <az-pixel-button variant="ghost" (click)="mode.set('joinInput')">
            Unirse con código
          </az-pixel-button>
          <az-pixel-button variant="danger" (click)="cancel()">
            Cancelar
          </az-pixel-button>
        </div>
      } @else {
        <az-pixel-heading [level]="3" tone="accent">
          Ingresá el código
        </az-pixel-heading>
        <form (ngSubmit)="onJoin()" class="stack">
          <az-pixel-input
            label="Código de sala"
            placeholder="XXXXXX"
            [(ngModel)]="code"
            name="code"
            [maxLength]="6"
          />
          <div class="row">
            <az-pixel-button variant="ghost" (click)="mode.set('menu')">
              Volver
            </az-pixel-button>
            <az-pixel-button variant="primary" type="submit" [disabled]="!isValidCode()">
              Unirse
            </az-pixel-button>
          </div>
        </form>
      }
    </az-dialog-box>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .hint {
        margin: 0;
        font-size: 10px;
        color: var(--color-crt-ink-dim);
        line-height: 1.6;
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
      }
    `,
  ],
})
export class TempleDialog {
  readonly open = input<boolean>(false);
  readonly close = output<void>();
  readonly create = output<void>();
  readonly join = output<string>();

  protected readonly mode = signal<Mode>('menu');
  protected code = '';

  protected isValidCode(): boolean {
    return this.code.trim().length > 0;
  }

  protected onCreate(): void {
    this.create.emit();
    this.reset();
  }

  protected onJoin(): void {
    const trimmed = this.code.trim().toUpperCase();
    if (!trimmed) return;
    this.join.emit(trimmed);
    this.reset();
  }

  protected cancel(): void {
    this.close.emit();
    this.reset();
  }

  private reset(): void {
    this.mode.set('menu');
    this.code = '';
  }
}
