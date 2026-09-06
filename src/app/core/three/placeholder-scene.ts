// Escena de prueba para verificar el pipeline pixel-art antes de tener
// tileset. Renderiza un plano de pasto verde con un cuadrado marrón que
// oscila, para confirmar que el pixelation pass funciona y hay movimiento.
// Se retira en F3 cuando entre el TileMap real.

import * as THREE from 'three';
import { TopDownCameraRig } from './top-down-camera-rig';
import type { ThreeScene, ThreeSceneContext } from './three-scene';

export class PlaceholderScene implements ThreeScene {
  readonly scene = new THREE.Scene();
  private rig: TopDownCameraRig | null = null;
  private marker: THREE.Mesh | null = null;

  get camera(): THREE.Camera {
    if (!this.rig) throw new Error('PlaceholderScene: init not called');
    return this.rig.camera;
  }

  init(ctx: ThreeSceneContext): void {
    this.scene.background = new THREE.Color('#3fa34d');

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(32, 32),
      new THREE.MeshBasicMaterial({ color: '#4bb85a' }),
    );
    this.scene.add(ground);

    this.marker = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({ color: '#7a4a1e' }),
    );
    this.marker.position.z = 0.01;
    this.scene.add(this.marker);

    const aspect = ctx.virtualWidth / ctx.virtualHeight;
    this.rig = new TopDownCameraRig({ viewTilesWide: 20, aspect });
    this.rig.setTarget(0, 0);
    this.rig.update();
  }

  update(_dt: number, elapsed: number): void {
    if (!this.marker || !this.rig) return;
    this.marker.position.x = Math.cos(elapsed) * 4;
    this.marker.position.y = Math.sin(elapsed) * 4;
    this.rig.update();
  }

  resize(virtualWidth: number, virtualHeight: number): void {
    this.rig?.resize(virtualWidth / virtualHeight);
  }

  dispose(): void {
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        (obj.geometry as THREE.BufferGeometry).dispose();
        const mat = obj.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
    this.marker = null;
    this.rig = null;
  }
}
