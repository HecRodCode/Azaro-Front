// Orquestador único del canvas Three.js. Instancia el renderer, mantiene
// la escena activa, aplica el pipeline de pixelación y consume el rAF
// global de GameClock. Nunca hay más de una instancia viva.

import { DestroyRef, Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { GameClock } from '../game-loop/game-clock.service';
import { PixelationPass } from './pixelation-pass';
import type { ThreeScene } from './three-scene';

const VIRTUAL_WIDTH = 320;
const VIRTUAL_HEIGHT = 180;

@Injectable({ providedIn: 'root' })
export class SceneManager {
  private readonly clock = inject(GameClock);
  private readonly destroyRef = inject(DestroyRef);

  private renderer: THREE.WebGLRenderer | null = null;
  private pixelation: PixelationPass | null = null;
  private activeScene: ThreeScene | null = null;
  private unsubscribeTick: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.unmount());
  }

  mount(canvas: HTMLCanvasElement): void {
    if (this.renderer) return;

    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.pixelation = new PixelationPass({
      width: VIRTUAL_WIDTH,
      height: VIRTUAL_HEIGHT,
    });

    this.resizeToDisplaySize();
    this.resizeObserver = new ResizeObserver(() => this.resizeToDisplaySize());
    this.resizeObserver.observe(canvas);

    this.unsubscribeTick = this.clock.subscribe((dt, t) => this.tick(dt, t));
  }

  setScene(scene: ThreeScene): void {
    if (!this.renderer || !this.pixelation) {
      throw new Error('SceneManager: setScene called before mount');
    }
    this.activeScene?.dispose();
    this.activeScene = scene;
    scene.init({
      renderer: this.renderer,
      virtualWidth: VIRTUAL_WIDTH,
      virtualHeight: VIRTUAL_HEIGHT,
    });
    scene.resize(VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  }

  unmount(): void {
    this.unsubscribeTick?.();
    this.unsubscribeTick = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.activeScene?.dispose();
    this.activeScene = null;
    this.pixelation?.dispose();
    this.pixelation = null;
    this.renderer?.dispose();
    this.renderer = null;
    this.canvas = null;
  }

  private tick(deltaSeconds: number, elapsedSeconds: number): void {
    if (!this.renderer || !this.pixelation || !this.activeScene) return;

    this.activeScene.update(deltaSeconds, elapsedSeconds);

    this.renderer.setRenderTarget(this.pixelation.renderTarget);
    this.renderer.render(this.activeScene.scene, this.activeScene.camera);

    this.pixelation.present(this.renderer);
  }

  private resizeToDisplaySize(): void {
    if (!this.renderer || !this.canvas) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (width === 0 || height === 0) return;
    this.renderer.setSize(width, height, false);
  }
}
