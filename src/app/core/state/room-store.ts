// Estado global de sala/juego basado en signals (sin NgRx).
// Fuente única de verdad que consumen lobby, arena y HUD.

import { Injectable, signal } from '@angular/core';

export type RoomStatus = 'IDLE' | 'WAITING' | 'PLAYING' | 'FINISHED';

@Injectable({ providedIn: 'root' })
export class RoomStore {
  readonly status = signal<RoomStatus>('IDLE');
  readonly code = signal<string | null>(null);
}
