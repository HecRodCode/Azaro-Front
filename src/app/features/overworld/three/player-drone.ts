// Dron del jugador local. Renderiza un sprite plano, lee input del teclado,
// aplica colisión axis-separated contra la CollisionGrid y publica su
// posición al WorldStore para que overlays y cámara reaccionen.

import * as THREE from 'three';
import type { CollisionGrid } from '../../../core/three/collision-grid';
import type { KeyboardInputService } from '../../../core/input/keyboard-input.service';
import type { Facing, WorldStore } from '../../../core/state/world-store';

const DRONE_SPRITE_URL = '/assets/sprites/drone.png';
const MOVE_SPEED = 4; // tiles por segundo
const HALF_SIZE = 0.35; // media-diagonal para colisión (< 0.5 para deslizar en esquinas)
const SPRITE_SIZE = 0.9;

export class PlayerDrone {
  readonly object = new THREE.Group();
  private readonly mesh: THREE.Mesh;
  private readonly material: THREE.MeshBasicMaterial;
  private readonly geometry: THREE.PlaneGeometry;
  private texture: THREE.Texture | null = null;

  private x: number;
  private y: number;
  private facing: Facing = 'down';

  constructor(
    startX: number,
    startY: number,
    private readonly collision: CollisionGrid,
    private readonly keyboard: KeyboardInputService,
    private readonly world: WorldStore,
  ) {
    this.x = startX;
    this.y = startY;

    this.geometry = new THREE.PlaneGeometry(SPRITE_SIZE, SPRITE_SIZE);
    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.z = 0.5;
    this.object.add(this.mesh);
    this.syncMeshTransform();

    world.setPlayerPos(this.x, this.y);
    world.setFacing(this.facing);

    void this.loadSprite();
  }

  update(dt: number): void {
    const dx = (this.keyboard.right() ? 1 : 0) - (this.keyboard.left() ? 1 : 0);
    const dy = (this.keyboard.up() ? 1 : 0) - (this.keyboard.down() ? 1 : 0);

    if (dx === 0 && dy === 0) {
      this.world.setMoving(false);
      return;
    }

    const len = Math.hypot(dx, dy) || 1;
    const stepX = (dx / len) * MOVE_SPEED * dt;
    const stepY = (dy / len) * MOVE_SPEED * dt;

    const nextX = this.tryMoveAxis(this.x, this.y, stepX, 0);
    const nextY = this.tryMoveAxis(nextX, this.y, 0, stepY);

    const moved = nextX !== this.x || nextY !== this.y;
    this.x = nextX;
    this.y = nextY;

    // Facing: prioriza el eje con más magnitud de input.
    if (Math.abs(dx) > Math.abs(dy)) {
      this.facing = dx > 0 ? 'right' : 'left';
    } else {
      this.facing = dy > 0 ? 'up' : 'down';
    }

    this.syncMeshTransform();
    this.world.setPlayerPos(this.x, this.y);
    this.world.setFacing(this.facing);
    this.world.setMoving(moved);
  }

  get position(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.texture?.dispose();
    this.texture = null;
  }

  private tryMoveAxis(
    fromX: number,
    fromY: number,
    dx: number,
    dy: number,
  ): number {
    const targetX = fromX + dx;
    const targetY = fromY + dy;
    if (this.collidesAt(targetX, targetY)) {
      return dx !== 0 ? fromX : fromY;
    }
    return dx !== 0 ? targetX : targetY;
  }

  private collidesAt(cx: number, cy: number): boolean {
    // Chequeo de los 4 vértices del AABB del dron.
    const corners: Array<[number, number]> = [
      [cx - HALF_SIZE, cy - HALF_SIZE],
      [cx + HALF_SIZE, cy - HALF_SIZE],
      [cx - HALF_SIZE, cy + HALF_SIZE],
      [cx + HALF_SIZE, cy + HALF_SIZE],
    ];
    for (const [px, py] of corners) {
      if (this.collision.isSolidAt(px, py)) return true;
    }
    return false;
  }

  private syncMeshTransform(): void {
    this.mesh.position.x = this.x;
    this.mesh.position.y = this.y;
    // El sprite mira "hacia arriba" por default; rotamos según facing.
    const rotations: Record<Facing, number> = {
      up: 0,
      right: -Math.PI / 2,
      down: Math.PI,
      left: Math.PI / 2,
    };
    this.mesh.rotation.z = rotations[this.facing];
  }

  private async loadSprite(): Promise<void> {
    const loader = new THREE.TextureLoader();
    this.texture = await loader.loadAsync(DRONE_SPRITE_URL);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.generateMipmaps = false;
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.material.map = this.texture;
    this.material.needsUpdate = true;
  }
}
