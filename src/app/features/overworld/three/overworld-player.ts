// Personaje del jugador local en el overworld. Renderiza un sprite plano
// desde un spritesheet 4-dir × 2-frame (columnas = down/left/right/up,
// filas = idle/walk), lee input del teclado, aplica colisión axis-separated
// contra la CollisionGrid y publica posición al WorldStore. El sprite NO
// rota: el frame cambia según facing y se alterna con un timer mientras
// se está moviendo. Reservamos la clase "Dron" para la arena de combate.

import * as THREE from 'three';
import type { CollisionGrid } from '../../../core/three/collision-grid';
import type { KeyboardInputService } from '../../../core/input/keyboard-input.service';
import type { Facing, WorldStore } from '../../../core/state/world-store';

const SPRITE_URL = '/assets/sprites/character.png';
const SPRITE_SIZE = 1;          // 1 tile de mundo
const MOVE_SPEED = 4.5;         // tiles por segundo
const HALF_SIZE = 0.32;         // media-diagonal AABB (< 0.5 → desliza en esquinas)
const WALK_FRAME_DURATION = 0.18; // segundos por frame de caminata

const SHEET_COLS = 4;
const SHEET_ROWS = 2;
const COL_BY_FACING: Record<Facing, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

export class OverworldPlayer {
  readonly object = new THREE.Group();
  private readonly mesh: THREE.Mesh;
  private readonly material: THREE.MeshBasicMaterial;
  private readonly geometry: THREE.PlaneGeometry;
  private texture: THREE.Texture | null = null;

  private x: number;
  private y: number;
  private facing: Facing = 'down';
  private walkFrame = 0;
  private walkTimer = 0;

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
    // z entre el mapa (0..~0.007) y overlays; el personaje siempre encima.
    this.mesh.position.z = 0.5;
    this.object.add(this.mesh);
    this.syncMeshPosition();

    world.setPlayerPos(this.x, this.y);
    world.setFacing(this.facing);

    void this.loadSprite();
  }

  update(dt: number): void {
    // Mientras haya diálogo, el input se congela.
    if (this.world.dialogOpen()) {
      if (this.world.moving()) this.world.setMoving(false);
      return;
    }

    const dx = (this.keyboard.right() ? 1 : 0) - (this.keyboard.left() ? 1 : 0);
    const dy = (this.keyboard.up() ? 1 : 0) - (this.keyboard.down() ? 1 : 0);

    if (dx === 0 && dy === 0) {
      this.world.setMoving(false);
      this.walkFrame = 0;
      this.walkTimer = 0;
      this.applyUvFrame();
      return;
    }

    // Facing: eje con más magnitud manda; empate → prioriza vertical (más
    // natural para personajes top-down que idle en Y).
    if (Math.abs(dx) > Math.abs(dy)) {
      this.facing = dx > 0 ? 'right' : 'left';
    } else {
      this.facing = dy > 0 ? 'up' : 'down';
    }

    const len = Math.hypot(dx, dy) || 1;
    const stepX = (dx / len) * MOVE_SPEED * dt;
    const stepY = (dy / len) * MOVE_SPEED * dt;

    // Axis-separated: probamos X, después Y (usando X ya resuelto). Si un
    // eje choca se descarta ese paso solo; el otro sigue → deslizar contra
    // esquinas.
    let nextX = this.x;
    if (stepX !== 0) {
      const candidateX = this.x + stepX;
      if (!this.collidesAt(candidateX, this.y)) nextX = candidateX;
    }
    let nextY = this.y;
    if (stepY !== 0) {
      const candidateY = this.y + stepY;
      if (!this.collidesAt(nextX, candidateY)) nextY = candidateY;
    }

    const moved = nextX !== this.x || nextY !== this.y;
    this.x = nextX;
    this.y = nextY;

    // Animación de caminata: alterna frame 0/1 mientras haya intento de
    // movimiento (aunque el paso quede cancelado por colisión, para que
    // "empujar contra pared" no se congele).
    this.walkTimer += dt;
    if (this.walkTimer >= WALK_FRAME_DURATION) {
      this.walkTimer -= WALK_FRAME_DURATION;
      this.walkFrame = this.walkFrame === 0 ? 1 : 0;
    }

    this.syncMeshPosition();
    this.applyUvFrame();
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

  private collidesAt(cx: number, cy: number): boolean {
    // AABB del personaje contra el grid. 4 esquinas es suficiente porque el
    // half-size es menor que 0.5 tile — nunca puede saltarse un tile entero
    // en un frame a la velocidad actual.
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

  private syncMeshPosition(): void {
    this.mesh.position.x = this.x;
    this.mesh.position.y = this.y;
  }

  private applyUvFrame(): void {
    if (!this.texture) return;
    const col = COL_BY_FACING[this.facing];
    const row = this.walkFrame; // 0 idle, 1 walk
    // flipY = true (default en Three): fila 0 del PNG (arriba) ocupa V=[0.5, 1].
    this.texture.repeat.set(1 / SHEET_COLS, 1 / SHEET_ROWS);
    this.texture.offset.set(col / SHEET_COLS, 1 - (row + 1) / SHEET_ROWS);
  }

  private async loadSprite(): Promise<void> {
    const loader = new THREE.TextureLoader();
    this.texture = await loader.loadAsync(SPRITE_URL);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.generateMipmaps = false;
    this.texture.colorSpace = THREE.SRGBColorSpace;
    // Sin wrap: cada frame se posiciona explícitamente vía offset+repeat.
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.material.map = this.texture;
    this.material.needsUpdate = true;
    this.applyUvFrame();
  }
}
