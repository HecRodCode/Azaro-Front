// Zona interactiva del overworld: rectángulo en coords de mundo con un id
// y un tipo semántico (ej. "temple"). No renderiza nada; solo responde a
// containsPoint(x, y). Se construye desde un objeto de la capa objectgroup
// "zones" del .tmj (coords en píxeles, Y desde arriba) → mundo (Y up).

import type { TiledObject } from './tiled-map-loader';

export interface ZoneBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export class InteractionZone {
  readonly id: string;
  readonly zoneType: string;
  readonly bounds: ZoneBounds;
  /** Punto donde anclar el prompt (top-center de la zona, en coords de mundo). */
  readonly anchor: Vec2;

  constructor(init: { id: string; zoneType: string; bounds: ZoneBounds; anchor: Vec2 }) {
    this.id = init.id;
    this.zoneType = init.zoneType;
    this.bounds = init.bounds;
    this.anchor = init.anchor;
  }

  containsPoint(x: number, y: number): boolean {
    const b = this.bounds;
    return x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY;
  }

  static fromTiled(
    obj: TiledObject,
    mapHeightTiles: number,
    tilePx: number,
  ): InteractionZone {
    const xTiles = obj.x / tilePx;
    const yTilesFromTop = obj.y / tilePx;
    const wTiles = obj.width / tilePx;
    const hTiles = obj.height / tilePx;
    const minX = xTiles;
    const maxX = xTiles + wTiles;
    const maxY = mapHeightTiles - yTilesFromTop;
    const minY = maxY - hTiles;

    const zoneProp = obj.properties?.find((p) => p.name === 'zoneType');
    const zoneType =
      typeof zoneProp?.value === 'string' ? zoneProp.value : obj.type || 'zone';

    return new InteractionZone({
      id: obj.name || `zone-${obj.id}`,
      zoneType,
      bounds: { minX, minY, maxX, maxY },
      anchor: { x: (minX + maxX) / 2, y: maxY },
    });
  }
}
