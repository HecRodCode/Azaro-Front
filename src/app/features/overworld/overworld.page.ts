// Pantalla del overworld: host del canvas Three.js que ocupa el viewport y
// orquesta las overlays DOM (prompt indicator + templeDialog). La escena y
// el bucle de render viven en core/three/ (SceneManager); esta página abre
// el diálogo del templo cuando el jugador pisa la zona y pulsa la tecla de
// acción, y despacha los eventos Crear/Unirse (aún stub — F6 los cablea al
// backend real).

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { SceneManager } from '../../core/three/scene-manager';
import { KeyboardInputService } from '../../core/input/keyboard-input.service';
import { WorldStore } from '../../core/state/world-store';
import { PromptIndicator } from '../../shared/game';
import { TempleDialog } from './dialogs/temple-dialog';
import { OverworldScene } from './three/overworld-scene';

@Component({
  selector: 'az-overworld',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PromptIndicator, TempleDialog],
  template: `
    <canvas #canvas></canvas>
    <az-prompt-indicator
      [visible]="promptVisible()"
      [anchorNdc]="world.promptAnchorNdc()"
      label="E"
    />
    <az-temple-dialog
      [open]="templeOpen()"
      (close)="closeDialog()"
      (create)="onCreate()"
      (join)="onJoin($event)"
    />
  `,
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
  private readonly keyboard = inject(KeyboardInputService);
  protected readonly world = inject(WorldStore);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly promptVisible = computed(
    () => this.world.activeZoneId() !== null && !this.world.dialogOpen(),
  );

  protected readonly templeOpen = computed(
    () => this.world.dialogOpen() && this.world.activeZoneId() === 'temple',
  );

  private prevAction = false;

  constructor() {
    // Solo el flanco de subida abre el diálogo — así al soltar y volver a
    // pulsar E fuera de la zona no se reactiva por accidente.
    effect(() => {
      const now = this.keyboard.action();
      const rising = now && !this.prevAction;
      this.prevAction = now;
      if (!rising) return;
      if (this.world.dialogOpen()) return;
      if (this.world.activeZoneId() !== 'temple') return;
      this.world.setDialogOpen(true);
    });
  }

  ngAfterViewInit(): void {
    this.sceneManager.mount(this.canvasRef().nativeElement);
    this.sceneManager.setScene(new OverworldScene(this.keyboard, this.world));
  }

  ngOnDestroy(): void {
    this.sceneManager.unmount();
  }

  protected closeDialog(): void {
    this.world.setDialogOpen(false);
  }

  protected onCreate(): void {
    // TODO(F6): reemplazar por RoomsService.create() → navega a /arena/:code.
    console.info('[TempleDialog] Crear sala (stub, pendiente de backend)');
    this.closeDialog();
  }

  protected onJoin(code: string): void {
    // TODO(F6): reemplazar por RoomsService.join(code) → navega a /arena/:code.
    console.info('[TempleDialog] Unirse a sala (stub, pendiente de backend):', code);
    this.closeDialog();
  }
}
