// Escena principal del overworld: carga overworld.tmj + atlas y monta el
// TileMap. Aún no incluye jugador ni zonas activas (F4/F5). La cámara se
// centra en el mapa y clamp a sus bordes.

import * as THREE from 'three';
import { TopDownCameraRig } from '../../../core/three/top-down-camera-rig';
import { TileMap } from '../../../core/three/tile-map';
import { TilesetAtlas } from '../../../core/three/tileset-atlas';
import { loadTiledMap, type TiledMap } from '../../../core/three/tiled-map-loader';
import type { ThreeScene, ThreeSceneContext } from '../../../core/three/three-scene';

const MAP_URL = '/assets/maps/overworld.tmj';

export class OverworldScene implements ThreeScene {
  readonly scene = new THREE.Scene();
  private rig: TopDownCameraRig | null = null;
  private tileMap: TileMap | null = null;
  private atlas: TilesetAtlas | null = null;
  private tiledMap: TiledMap | null = null;
  private ready = false;

  get camera(): THREE.Camera {
    if (!this.rig) throw new Error('OverworldScene: init not called');
    return this.rig.camera;
  }

  init(ctx: ThreeSceneContext): void {
    this.scene.background = new THREE.Color('#0b1010');
    const aspect = ctx.virtualWidth / ctx.virtualHeight;
    this.rig = new TopDownCameraRig({ viewTilesWide: 18, aspect });
    this.rig.setTarget(10, 7.5); // centro del mapa 20×15
    this.rig.update();
    void this.loadAssets();
  }

  update(_dt: number, _elapsed: number): void {
    if (!this.ready || !this.rig) return;
    this.rig.update();
  }

  resize(virtualWidth: number, virtualHeight: number): void {
    this.rig?.resize(virtualWidth / virtualHeight);
  }

  dispose(): void {
    this.tileMap?.dispose();
    this.atlas?.dispose();
    this.scene.clear();
    this.tileMap = null;
    this.atlas = null;
    this.tiledMap = null;
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

    this.rig?.setBounds({
      minX: 0,
      maxX: this.tiledMap.width,
      minY: 0,
      maxY: this.tiledMap.height,
    });
    this.rig?.setTarget(this.tiledMap.width / 2, this.tiledMap.height / 2);
    this.rig?.update();

    this.ready = true;
  }
}
