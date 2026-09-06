// Carga una textura de tileset y expone las coordenadas UV para cada gid.
// Usa NearestFilter (sin blur) y sRGB. La UV se calcula con flipY=true
// (default de Three): fila 0 de la imagen queda arriba en pantalla.

import * as THREE from 'three';
import type { TiledTilesetRef } from './tiled-map-loader';

export interface TileUV {
  u0: number;
  v0: number; // borde inferior en UV (menor Y de textura)
  u1: number;
  v1: number; // borde superior en UV
}

export class TilesetAtlas {
  readonly texture: THREE.Texture;
  readonly firstgid: number;
  readonly columns: number;
  readonly tilecount: number;
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly imageWidth: number;
  readonly imageHeight: number;

  private constructor(texture: THREE.Texture, meta: TiledTilesetRef) {
    this.texture = texture;
    this.firstgid = meta.firstgid;
    this.columns = meta.columns;
    this.tilecount = meta.tilecount;
    this.tileWidth = meta.tilewidth;
    this.tileHeight = meta.tileheight;
    this.imageWidth = meta.imagewidth;
    this.imageHeight = meta.imageheight;
  }

  static async load(meta: TiledTilesetRef): Promise<TilesetAtlas> {
    const loader = new THREE.TextureLoader();
    const texture = await loader.loadAsync(meta.image);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return new TilesetAtlas(texture, meta);
  }

  ownsGid(gid: number): boolean {
    return gid >= this.firstgid && gid < this.firstgid + this.tilecount;
  }

  /** Devuelve UVs {u0,v0,u1,v1} para un gid; (u0,v0) es esquina INFERIOR-IZQUIERDA. */
  getUV(gid: number): TileUV {
    const local = gid - this.firstgid;
    const col = local % this.columns;
    const row = Math.floor(local / this.columns);
    const u0 = (col * this.tileWidth) / this.imageWidth;
    const u1 = ((col + 1) * this.tileWidth) / this.imageWidth;
    // flipY = true: (v=1) es el top de la imagen. El tile en la fila `row`
    // ocupa desde y=row*tileH hasta y=(row+1)*tileH en píxeles de imagen.
    const v1 = 1 - (row * this.tileHeight) / this.imageHeight;
    const v0 = 1 - ((row + 1) * this.tileHeight) / this.imageHeight;
    return { u0, v0, u1, v1 };
  }

  dispose(): void {
    this.texture.dispose();
  }
}
