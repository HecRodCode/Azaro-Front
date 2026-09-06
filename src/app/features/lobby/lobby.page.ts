// Pantalla inicial: crear sala nueva o unirse con código. Solo UI por ahora,
// la integración con la API vive en core/ (aún no implementada).

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PixelButton } from '../../shared/ui/pixel-button/pixel-button';

@Component({
  selector: 'az-lobby',
  imports: [FormsModule, PixelButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="screen">
      <header class="title">
        <h1>AZARO</h1>
        <p class="subtitle">-- press start --</p>
      </header>

      <section class="panel">
        <h2>NUEVA PARTIDA</h2>
        <label>
          <span>TEMA</span>
          <input type="text" [(ngModel)]="topic" placeholder="javascript" />
        </label>
        <az-pixel-button variant="primary" (click)="createRoom()">
          CREAR SALA
        </az-pixel-button>
      </section>

      <section class="panel">
        <h2>UNIRSE</h2>
        <label>
          <span>CÓDIGO</span>
          <input type="text" [(ngModel)]="joinCode" maxlength="6" placeholder="XXXXXX" />
        </label>
        <az-pixel-button variant="ghost" (click)="joinRoom()">
          UNIRSE
        </az-pixel-button>
      </section>
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
      }
      .title h1 {
        font-size: 40px;
        color: var(--color-crt-accent);
        text-shadow: 4px 4px 0 var(--color-crt-shadow);
        margin: 0;
        text-align: center;
        letter-spacing: 0.2em;
      }
      .subtitle {
        text-align: center;
        color: var(--color-crt-ink-dim);
        margin-top: 12px;
        animation: blink 1s step-end infinite;
      }
      @keyframes blink {
        50% { opacity: 0; }
      }
      .panel {
        width: min(360px, 100%);
        border: 3px solid var(--color-crt-border);
        background: var(--color-crt-bg-alt);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-shadow: 6px 6px 0 var(--color-crt-shadow);
      }
      .panel h2 {
        margin: 0 0 4px;
        font-size: 12px;
        color: var(--color-crt-accent-hot);
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 10px;
        color: var(--color-crt-ink-dim);
      }
      input {
        font-family: var(--font-pixel);
        font-size: 12px;
        padding: 10px;
        background: var(--color-crt-bg);
        border: 2px solid var(--color-crt-border);
        color: var(--color-crt-ink);
        outline: none;
        text-transform: uppercase;
      }
      input:focus {
        border-color: var(--color-crt-accent);
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
