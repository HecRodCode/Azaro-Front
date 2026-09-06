// Grid booleano de solidez derivado de un TiledMap. Se construye una vez
// al cargar el mapa y responde `isSolidAt(x, y)` en coordenadas de mundo
// (1 unidad = 1 tile). Usa la propiedad `solid` de la sección `tiles` del
// tileset para saber qué gids bloquean.

import type { TiledMap, TiledTilesetRef } from './tiled-map-loader';

export class CollisionGrid {
  readonly widthInTiles: number;
  readonly heightInTiles: number;
  private readonly grid: Uint8Array;

  constructor(map: TiledMap) {
    this.widthInTiles = map.width;
    this.heightInTiles = map.height;
    this.grid = new Uint8Array(map.width * map.height);

    const solidGids = collectSolidGids(map.tilesets);

    for (const layer of map.layers) {
      if (layer.type !== 'tilelayer') continue;
      for (let row = 0; row < layer.height; row++) {
        for (let col = 0; col < layer.width; col++) {
          const gid = layer.data[row * layer.width + col];
          if (gid !== 0 && solidGids.has(gid)) {
            this.grid[row * layer.width + col] = 1;
          }
        }
      }
    }
  }

  /** Coordenadas en unidades de mundo (Y crece hacia arriba). */
  isSolidAt(worldX: number, worldY: number): boolean {
    const col = Math.floor(worldX);
    const rowFromBottom = Math.floor(worldY);
    const rowFromTop = this.heightInTiles - 1 - rowFromBottom;
    if (col < 0 || col >= this.widthInTiles) return true;
    if (rowFromTop < 0 || rowFromTop >= this.heightInTiles) return true;
    return this.grid[rowFromTop * this.widthInTiles + col] === 1;
  }
}

function collectSolidGids(tilesets: TiledTilesetRef[]): Set<number> {
  const solid = new Set<number>();
  for (const ts of tilesets) {
    if (!ts.tiles) continue;
    for (const tile of ts.tiles) {
      const isSolid = tile.properties?.some(
        (p) => p.name === 'solid' && p.value === true,
      );
      if (isSolid) solid.add(ts.firstgid + tile.id);
    }
  }
  return solid;
}
