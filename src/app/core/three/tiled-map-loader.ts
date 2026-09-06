// Parser tipado del formato Tiled JSON (.tmj) — versión mínima que solo
// entiende lo que usamos: mapas ortogonales, capas de tiles y objectgroups.
// No toca Three.js. Devuelve la ruta absoluta del tileset resuelta contra
// la URL del .tmj para que el atlas se cargue desde el sitio correcto.

export interface TiledTilesetRef {
  firstgid: number;
  image: string; // ruta absoluta ya resuelta
  imagewidth: number;
  imageheight: number;
  tilewidth: number;
  tileheight: number;
  columns: number;
  tilecount: number;
  margin: number;
  spacing: number;
  name: string;
}

export interface TiledTileLayer {
  type: 'tilelayer';
  name: string;
  width: number;
  height: number;
  data: number[];
  visible: boolean;
  opacity: number;
}

export interface TiledObjectProperty {
  name: string;
  type: string;
  value: string | number | boolean;
}

export interface TiledObject {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  properties?: TiledObjectProperty[];
}

export interface TiledObjectGroup {
  type: 'objectgroup';
  name: string;
  objects: TiledObject[];
  visible: boolean;
  opacity: number;
}

export type TiledLayer = TiledTileLayer | TiledObjectGroup;

export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
  tilesets: TiledTilesetRef[];
}

export async function loadTiledMap(url: string): Promise<TiledMap> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TiledMapLoader: failed to fetch ${url} (${response.status})`);
  }
  const raw = (await response.json()) as RawTiledMap;
  return normalize(raw, url);
}

// --- normalización ---------------------------------------------------------

interface RawTiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: RawTiledLayer[];
  tilesets: RawTilesetRef[];
}

interface RawTilesetRef {
  firstgid: number;
  image: string;
  imagewidth: number;
  imageheight: number;
  tilewidth: number;
  tileheight: number;
  columns: number;
  tilecount: number;
  margin: number;
  spacing: number;
  name: string;
}

type RawTiledLayer = TiledTileLayer | TiledObjectGroup;

function normalize(raw: RawTiledMap, tmjUrl: string): TiledMap {
  return {
    width: raw.width,
    height: raw.height,
    tilewidth: raw.tilewidth,
    tileheight: raw.tileheight,
    layers: raw.layers,
    tilesets: raw.tilesets.map((t) => ({
      ...t,
      image: new URL(t.image, new URL(tmjUrl, window.location.href)).pathname,
    })),
  };
}
