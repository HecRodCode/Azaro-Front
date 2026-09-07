// Estado global del overworld basado en signals (sin NgRx). Fuente única
// de verdad de dónde está el jugador, hacia dónde mira, si se mueve, qué
// zona interactiva está pisando y si hay un diálogo abierto que bloquea
// input. Consumido por PlayerDrone y OverworldScene (escriben) y por
// overlays DOM como PromptIndicator o TempleDialog (leen).

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
  /** Ancla del prompt en coords normalizadas de la cámara (-1..1, Y up). */
  readonly promptAnchorNdc = signal<Vec2 | null>(null);
  readonly dialogOpen = signal<boolean>(false);

  setPlayerPos(x: number, y: number): void {
    this.playerPos.set({ x, y });
  }

  setFacing(facing: Facing): void {
    this.facing.set(facing);
  }

  setMoving(moving: boolean): void {
    if (this.moving() !== moving) this.moving.set(moving);
  }

  setActiveZone(id: string | null): void {
    if (this.activeZoneId() !== id) this.activeZoneId.set(id);
  }

  setPromptAnchorNdc(pos: Vec2 | null): void {
    this.promptAnchorNdc.set(pos);
  }

  setDialogOpen(open: boolean): void {
    if (this.dialogOpen() !== open) this.dialogOpen.set(open);
  }
}
