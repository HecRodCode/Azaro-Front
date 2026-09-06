// Escena principal del overworld: carga overworld.tmj + atlas, monta el
// TileMap, coloca al PlayerDrone en su spawn y hace que la cámara lo siga
// con clamping a los bordes del mapa. Recibe servicios por constructor
// porque las escenas viven fuera del DI de Angular.

import * as THREE from 'three';
import { KeyboardInputService } from '../../../core/input/keyboard-input.service';
import { WorldStore } from '../../../core/state/world-store';
import { CollisionGrid } from '../../../core/three/collision-grid';
import { TileMap } from '../../../core/three/tile-map';
import { TilesetAtlas } from '../../../core/three/tileset-atlas';
import {
  loadTiledMap,
  type TiledMap,
  type TiledObject,
} from '../../../core/three/tiled-map-loader';
import { TopDownCameraRig } from '../../../core/three/top-down-camera-rig';
import type { ThreeScene, ThreeSceneContext } from '../../../core/three/three-scene';
import { PlayerDrone } from './player-drone';

const MAP_URL = '/assets/maps/overworld.tmj';

export class OverworldScene implements ThreeScene {
  readonly scene = new THREE.Scene();
  private rig: TopDownCameraRig | null = null;
  private tileMap: TileMap | null = null;
  private atlas: TilesetAtlas | null = null;
  private tiledMap: TiledMap | null = null;
  private collision: CollisionGrid | null = null;
  private player: PlayerDrone | null = null;
  private ready = false;

  constructor(
    private readonly keyboard: KeyboardInputService,
    private readonly world: WorldStore,
  ) {}

  get camera(): THREE.Camera {
    if (!this.rig) throw new Error('OverworldScene: init not called');
    return this.rig.camera;
  }

  init(ctx: ThreeSceneContext): void {
    this.scene.background = new THREE.Color('#0b1010');
    const aspect = ctx.virtualWidth / ctx.virtualHeight;
    this.rig = new TopDownCameraRig({ viewTilesWide: 18, aspect });
    this.rig.setTarget(10, 7.5);
    this.rig.update();
    void this.loadAssets();
  }

  update(dt: number, _elapsed: number): void {
    if (!this.ready || !this.rig) return;
    this.player?.update(dt);
    if (this.player) {
      const p = this.player.position;
      this.rig.setTarget(p.x, p.y);
    }
    this.rig.update();
  }

  resize(virtualWidth: number, virtualHeight: number): void {
    this.rig?.resize(virtualWidth / virtualHeight);
  }

  dispose(): void {
    this.player?.dispose();
    this.tileMap?.dispose();
    this.atlas?.dispose();
    this.scene.clear();
    this.player = null;
    this.tileMap = null;
    this.atlas = null;
    this.tiledMap = null;
    this.collision = null;
    this.rig = null;
    this.ready = false;
  }

  private async loadAssets(): Promise<void> {
    this.tiledMap = await loadTiledMap(MAP_URL);
    const tilesetRef = this.tiledMap.tilesets[0];
    if (!tilesetRef) throw new Error('OverworldScene: map has no tilesets');
    this.atlas = await TilesetAtlas.load(tilesetRef);
    this.tileMap = new TileMap(this.tiledMap, this.atlas);
    this.scene.add(this.tileMap.object);

    this.collision = new CollisionGrid(this.tiledMap);

    const spawn = this.resolveSpawn(this.tiledMap);
    this.player = new PlayerDrone(
      spawn.x,
      spawn.y,
      this.collision,
      this.keyboard,
      this.world,
    );
    this.scene.add(this.player.object);

    this.rig?.setBounds({
      minX: 0,
      maxX: this.tiledMap.width,
      minY: 0,
      maxY: this.tiledMap.height,
    });
    this.rig?.setTarget(spawn.x, spawn.y);
    this.rig?.update();

    this.ready = true;
  }

  /** Extrae el objeto `player` de la capa `spawns` y convierte a coords de mundo. */
  private resolveSpawn(map: TiledMap): { x: number; y: number } {
    const spawnLayer = map.layers.find(
      (l) => l.type === 'objectgroup' && l.name === 'spawns',
    );
    let raw: TiledObject | undefined;
    if (spawnLayer && spawnLayer.type === 'objectgroup') {
      raw = spawnLayer.objects.find((o) => o.name === 'player');
    }
    if (!raw) return { x: map.width / 2, y: map.height / 2 };

    const centerPxX = raw.x + raw.width / 2;
    const centerPxY = raw.y + raw.height / 2;
    const col = centerPxX / map.tilewidth;
    const rowFromTop = centerPxY / map.tileheight;
    return {
      x: col,
      y: map.height - rowFromTop,
    };
  }
}
