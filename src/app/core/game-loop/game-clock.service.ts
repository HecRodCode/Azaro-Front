// Bucle de render único de la app basado en requestAnimationFrame.
// Cualquier sistema que necesite un tick por frame se suscribe aquí.
// Vive fuera del ciclo de change detection de Angular (zoneless).

import { Injectable, OnDestroy } from '@angular/core';

export type TickHandler = (deltaSeconds: number, elapsedSeconds: number) => void;

@Injectable({ providedIn: 'root' })
export class GameClock implements OnDestroy {
  private handlers = new Set<TickHandler>();
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private startTimestamp = 0;

  subscribe(handler: TickHandler): () => void {
    this.handlers.add(handler);
    if (this.rafId === null) this.start();
    return () => this.unsubscribe(handler);
  }

  unsubscribe(handler: TickHandler): void {
    this.handlers.delete(handler);
    if (this.handlers.size === 0) this.stop();
  }

  ngOnDestroy(): void {
    this.stop();
    this.handlers.clear();
  }

  private start(): void {
    this.lastTimestamp = 0;
    this.startTimestamp = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  private stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private readonly tick = (timestamp: number): void => {
    if (this.startTimestamp === 0) {
      this.startTimestamp = timestamp;
      this.lastTimestamp = timestamp;
    }
    // Cap deltaSeconds a 100ms para evitar saltos gigantes tras un tab dormido.
    const deltaSeconds = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    const elapsedSeconds = (timestamp - this.startTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    for (const handler of this.handlers) handler(deltaSeconds, elapsedSeconds);

    this.rafId = requestAnimationFrame(this.tick);
  };
}
