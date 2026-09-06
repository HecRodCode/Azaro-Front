// Pantalla inicial: crear sala nueva o unirse con código. Solo UI por ahora,
// la integración con la API vive en core/ (aún no implementada).

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PixelButton,
  PixelHeading,
  PixelInput,
  PixelPanel,
} from '../../shared/ui';

@Component({
  selector: 'az-lobby',
  imports: [FormsModule, PixelButton, PixelPanel, PixelInput, PixelHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="screen">
      <header class="title">
        <az-pixel-heading [level]="1" tone="accent">AZARO</az-pixel-heading>
        <p class="subtitle">-- press start --</p>
      </header>

      <az-pixel-panel>
        <az-pixel-heading slot="header" tone="hot">NUEVA PARTIDA</az-pixel-heading>
        <az-pixel-input
          label="TEMA"
          placeholder="javascript"
          [(ngModel)]="topic"
        />
        <az-pixel-button variant="primary" (click)="createRoom()">
          CREAR SALA
        </az-pixel-button>
      </az-pixel-panel>

      <az-pixel-panel>
        <az-pixel-heading slot="header" tone="hot">UNIRSE</az-pixel-heading>
        <az-pixel-input
          label="CÓDIGO"
          placeholder="XXXXXX"
          [maxLength]="6"
          [(ngModel)]="joinCode"
        />
        <az-pixel-button variant="ghost" (click)="joinRoom()">
          UNIRSE
        </az-pixel-button>
      </az-pixel-panel>
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
        gap: 32px;
        padding: 32px 16px;
        max-width: 400px;
        margin: 0 auto;
      }
      .title {
        text-align: center;
      }
      .subtitle {
        color: var(--color-crt-ink-dim);
        margin-top: 12px;
        animation: blink 1s step-end infinite;
      }
      @keyframes blink {
        50% {
          opacity: 0;
        }
      }
    `,
  ],
})
export class LobbyPage {
  protected readonly topic = signal('');
  protected readonly joinCode = signal('');

  protected createRoom(): void {
    // pendiente: llamar a RoomsService cuando exista
  }

  protected joinRoom(): void {
    // pendiente: llamar a RoomsService cuando exista
  }
}
