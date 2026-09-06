// Construye la geometría del mapa: un Mesh por capa de tiles con BufferGeometry
// merged (2 triángulos por tile no-cero). Una unidad de mundo = un tile.
// El mapa se ancla con esquina superior-izquierda en (0, 0); la Y crece hacia
// arriba, por eso las filas de Tiled se invierten al posicionar.

import * as THREE from 'three';
import type { TiledMap, TiledTileLayer } from './tiled-map-loader';
import type { TilesetAtlas } from './tileset-atlas';

export class TileMap {
  readonly object = new THREE.Group();
  readonly widthInTiles: number;
  readonly heightInTiles: number;
  private materials: THREE.MeshBasicMaterial[] = [];
  private geometries: THREE.BufferGeometry[] = [];

  constructor(map: TiledMap, atlas: TilesetAtlas) {
    this.widthInTiles = map.width;
    this.heightInTiles = map.height;

    for (const layer of map.layers) {
      if (layer.type !== 'tilelayer' || !layer.visible) continue;
      const mesh = this.buildLayerMesh(layer, atlas);
      if (mesh) this.object.add(mesh);
    }
  }

  dispose(): void {
    for (const geom of this.geometries) geom.dispose();
    for (const mat of this.materials) mat.dispose();
    this.geometries = [];
    this.materials = [];
  }

  private buildLayerMesh(
    layer: TiledTileLayer,
    atlas: TilesetAtlas,
  ): THREE.Mesh | null {
    const visibleTiles: { col: number; row: number; gid: number }[] = [];
    for (let row = 0; row < layer.height; row++) {
      for (let col = 0; col < layer.width; col++) {
        const gid = layer.data[row * layer.width + col];
        if (gid !== 0 && atlas.ownsGid(gid)) {
          visibleTiles.push({ col, row, gid });
        }
      }
    }
    if (visibleTiles.length === 0) return null;

    const count = visibleTiles.length;
    const positions = new Float32Array(count * 4 * 3);
    const uvs = new Float32Array(count * 4 * 2);
    const indices = new Uint32Array(count * 6);
    const flipRow = this.heightInTiles;

    for (let i = 0; i < count; i++) {
      const { col, row, gid } = visibleTiles[i];
      const x0 = col;
      const x1 = col + 1;
      const y0 = flipRow - row - 1; // fila Tiled arriba → mundo abajo
      const y1 = flipRow - row;
      const p = i * 12;
      positions[p + 0] = x0; positions[p + 1] = y0; positions[p + 2] = 0;
      positions[p + 3] = x1; positions[p + 4] = y0; positions[p + 5] = 0;
      positions[p + 6] = x1; positions[p + 7] = y1; positions[p + 8] = 0;
      positions[p + 9] = x0; positions[p + 10] = y1; positions[p + 11] = 0;

      const uv = atlas.getUV(gid);
      const u = i * 8;
      uvs[u + 0] = uv.u0; uvs[u + 1] = uv.v0;
      uvs[u + 2] = uv.u1; uvs[u + 3] = uv.v0;
      uvs[u + 4] = uv.u1; uvs[u + 5] = uv.v1;
      uvs[u + 6] = uv.u0; uvs[u + 7] = uv.v1;

      const base = i * 4;
      const idx = i * 6;
      indices[idx + 0] = base + 0;
      indices[idx + 1] = base + 1;
      indices[idx + 2] = base + 2;
      indices[idx + 3] = base + 0;
      indices[idx + 4] = base + 2;
      indices[idx + 5] = base + 3;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    const material = new THREE.MeshBasicMaterial({
      map: atlas.texture,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });

    this.geometries.push(geometry);
    this.materials.push(material);

    const mesh = new THREE.Mesh(geometry, material);
    // Empuja z para respetar orden de layers (ground abajo, objects encima).
    mesh.renderOrder = this.object.children.length;
    mesh.position.z = mesh.renderOrder * 0.001;
    return mesh;
  }
}
