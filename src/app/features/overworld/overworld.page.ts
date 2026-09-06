// Pantalla del overworld: host del canvas Three.js que ocupa el viewport.
// La escena y el bucle de render viven en core/three/ (SceneManager);
// esta página solo aporta el <canvas> y su ciclo de vida.

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';
import { SceneManager } from '../../core/three/scene-manager';
import { OverworldScene } from './three/overworld-scene';

@Component({
  selector: 'az-overworld',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas></canvas>`,
  styles: [
    `
      :host {
        display: block;
        position: fixed;
        inset: 0;
        overflow: hidden;
      }
      canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class OverworldPage implements AfterViewInit, OnDestroy {
  private readonly sceneManager = inject(SceneManager);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  ngAfterViewInit(): void {
    this.sceneManager.mount(this.canvasRef().nativeElement);
    this.sceneManager.setScene(new OverworldScene());
  }

  ngOnDestroy(): void {
    this.sceneManager.unmount();
  }
}
