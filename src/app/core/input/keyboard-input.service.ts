// Estado de teclado global. Escucha keydown/keyup en window y expone signals
// por dirección + método `isDown(code)`. Los sistemas que necesitan input
// (PlayerDrone) lo consumen sin acoplarse al DOM.

import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

const MOVE_KEYS = {
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  action: ['KeyE', 'Enter', 'Space'],
} as const;

export type MoveKey = keyof typeof MOVE_KEYS;

@Injectable({ providedIn: 'root' })
export class KeyboardInputService {
  private readonly pressed = signal<ReadonlySet<string>>(new Set());
  private readonly destroyRef = inject(DestroyRef);

  readonly up = computed(() => this.anyDown(MOVE_KEYS.up));
  readonly down = computed(() => this.anyDown(MOVE_KEYS.down));
  readonly left = computed(() => this.anyDown(MOVE_KEYS.left));
  readonly right = computed(() => this.anyDown(MOVE_KEYS.right));
  readonly action = computed(() => this.anyDown(MOVE_KEYS.action));

  constructor() {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', this.onDown);
    window.addEventListener('keyup', this.onUp);
    window.addEventListener('blur', this.onBlur);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', this.onDown);
      window.removeEventListener('keyup', this.onUp);
      window.removeEventListener('blur', this.onBlur);
    });
  }

  isDown(code: string): boolean {
    return this.pressed().has(code);
  }

  private anyDown(codes: readonly string[]): boolean {
    const set = this.pressed();
    for (const c of codes) if (set.has(c)) return true;
    return false;
  }

  private readonly onDown = (e: KeyboardEvent): void => {
    if (e.repeat) return;
    if (this.isTrackedKey(e.code)) e.preventDefault();
    this.pressed.update((s) => {
      if (s.has(e.code)) return s;
      const next = new Set(s);
      next.add(e.code);
      return next;
    });
  };

  private readonly onUp = (e: KeyboardEvent): void => {
    this.pressed.update((s) => {
      if (!s.has(e.code)) return s;
      const next = new Set(s);
      next.delete(e.code);
      return next;
    });
  };

  private readonly onBlur = (): void => {
    this.pressed.set(new Set());
  };

  private isTrackedKey(code: string): boolean {
    for (const group of Object.values(MOVE_KEYS)) {
      if ((group as readonly string[]).includes(code)) return true;
    }
    return false;
  }
}
