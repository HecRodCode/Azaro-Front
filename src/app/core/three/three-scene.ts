// Contrato mínimo que toda escena del canvas debe cumplir. El SceneManager
// solo habla con esta interfaz para instanciar, actualizar y destruir escenas.

import * as THREE from 'three';

export interface ThreeSceneContext {
  renderer: THREE.WebGLRenderer;
  /** Ancho lógico de la render target pixel-art (ej. 320). */
  virtualWidth: number;
  /** Alto lógico de la render target pixel-art (ej. 180). */
  virtualHeight: number;
}

export interface ThreeScene {
  readonly scene: THREE.Scene;
  readonly camera: THREE.Camera;

  init(ctx: ThreeSceneContext): void;
  update(deltaSeconds: number, elapsedSeconds: number): void;
  resize(virtualWidth: number, virtualHeight: number): void;
  dispose(): void;
}
