// Cámara ortográfica cenital tipo Pokémon GBA. Muestra un rectángulo fijo
// de "unidades de mundo" (tiles) en pantalla; sigue a un target con clamping
// opcional a los límites del mapa. Nada de perspectiva.

import * as THREE from 'three';

export interface CameraBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class TopDownCameraRig {
  readonly camera: THREE.OrthographicCamera;

  private target: THREE.Vector2 = new THREE.Vector2(0, 0);
  private bounds: CameraBounds | null = null;
  private viewTilesWide: number;
  private tileSize: number;

  constructor(params: { viewTilesWide: number; aspect: number; tileSize?: number }) {
    this.viewTilesWide = params.viewTilesWide;
    this.tileSize = params.tileSize ?? 1;
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);
    this.resize(params.aspect);
  }

  resize(aspect: number): void {
    const halfWidth = (this.viewTilesWide * this.tileSize) / 2;
    const halfHeight = halfWidth / aspect;
    this.camera.left = -halfWidth;
    this.camera.right = halfWidth;
    this.camera.top = halfHeight;
    this.camera.bottom = -halfHeight;
    this.camera.updateProjectionMatrix();
  }

  setTarget(x: number, y: number): void {
    this.target.set(x, y);
  }

  setBounds(bounds: CameraBounds | null): void {
    this.bounds = bounds;
  }

  update(): void {
    let x = this.target.x;
    let y = this.target.y;
    if (this.bounds) {
      const halfW = (this.camera.right - this.camera.left) / 2;
      const halfH = (this.camera.top - this.camera.bottom) / 2;
      x = THREE.MathUtils.clamp(x, this.bounds.minX + halfW, this.bounds.maxX - halfW);
      y = THREE.MathUtils.clamp(y, this.bounds.minY + halfH, this.bounds.maxY - halfH);
    }
    this.camera.position.x = x;
    this.camera.position.y = y;
  }
}
