// Estado global del overworld basado en signals (sin NgRx). Fuente única
// de verdad de dónde está el jugador, hacia dónde mira, si se mueve, y
// qué zona interactiva está pisando. Consumido por PlayerDrone (escribe) y
// por overlays DOM como PromptIndicator o TempleDialog (leen).

import { Injectable, signal } from '@angular/core';

export type Facing = 'up' | 'down' | 'left' | 'right';

export interface Vec2 {
  x: number;
  y: number;
}

@Injectable({ providedIn: 'root' })
export class WorldStore {
  readonly playerPos = signal<Vec2>({ x: 0, y: 0 });
  readonly facing = signal<Facing>('down');
  readonly moving = signal<boolean>(false);
  readonly activeZoneId = signal<string | null>(null);

  setPlayerPos(x: number, y: number): void {
    this.playerPos.set({ x, y });
  }

  setFacing(facing: Facing): void {
    this.facing.set(facing);
  }

  setMoving(moving: boolean): void {
    if (this.moving() !== moving) this.moving.set(moving);
  }
}
