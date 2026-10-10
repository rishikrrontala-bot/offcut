import type { RGB, Tile, Mask, Allocation } from './types';

export type MaterialReport = {
  required: number;
  available: number;
  shortage: number;
  unused: number;
  papers: { id: string; name: string; available: number; used: number }[];
  colourDifferences: { position: number; sourceId: string; distance: number }[];
};

function assertRgb(c: RGB, ctx: string): void {
  if (!Array.isArray(c) || c.length !== 3) throw new Error(`Invalid RGB at ${ctx}`);
  for (const v of c) {
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 255) {
      throw new Error(`RGB out of range at ${ctx}`);
    }
  }
}

function srgbToLinear(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToXyz(rgb: RGB): [number, number, number] {
  const r = srgbToLinear(rgb[0]);
  const g = srgbToLinear(rgb[1]);
  const b = srgbToLinear(rgb[2]);
  return [
    r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
    r * 0.2126729 + g * 0.7151522 + b * 0.0721750,
    r * 0.0193339 + g * 0.1191920 + b * 0.9503041,
  ];
}

function fLab(t: number): number {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
}

function rgbToLab(rgb: RGB): [number, number, number] {
  const [x, y, z] = rgbToXyz(rgb);
  const fx = fLab(x / 0.95047);
  const fy = fLab(y / 1.0);
  const fz = fLab(z / 1.08883);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE76(a: RGB, b: RGB): number {
  const [la, aa, ba] = rgbToLab(a);
  const [lb, ab, bb] = rgbToLab(b);
  return Math.sqrt((la - lb) ** 2 + (aa - ab) ** 2 + (ba - bb) ** 2);
}

export function materialReport(
  tiles: Tile[],
  masks: Mask[],
  grid: number,
  allocation?: Allocation,
  target?: RGB[],
): MaterialReport {
  if (![6,8].includes(grid)) throw new Error('Invalid grid');
  const required = grid * grid;

  const seenMask = new Set<string>();
  for (const m of masks) {
    if (seenMask.has(m.id)) throw new Error(`Duplicate mask id ${m.id}`);
    seenMask.add(m.id);
  }

  const included = masks.filter((m) => !m.excluded);
  const includedIds = new Set(included.map((m) => m.id));

  if (target) {
    if (!Array.isArray(target)) throw new Error('Target must be array');
    if (target.length !== required) throw new Error('Target length mismatch');
    for (let i = 0; i < required; i++) assertRgb(target[i], `target[${i}]`);
  }

  const availableByPaper = new Map<string, number>();
  for (const m of included) availableByPaper.set(m.id, 0);
  const tileIds=new Set<string>();
  for (const t of tiles) {
    if(tileIds.has(t.id))throw new Error('Duplicate inventory tile id');tileIds.add(t.id);assertRgb(t.color,`tile ${t.id}`);
    if (!t.scrapId) throw new Error(`Tile ${t.id} missing scrapId`);
    if (!seenMask.has(t.scrapId)) throw new Error(`Unknown tile scrapId ${t.scrapId}`);
    if(!includedIds.has(t.scrapId))continue;
    availableByPaper.set(t.scrapId, (availableByPaper.get(t.scrapId) || 0) + 1);
  }

  const available = included.reduce((s, m) => s + (availableByPaper.get(m.id) || 0), 0);
  const shortage = Math.max(0, required - available);
  let unused = available;

  const papers = masks.map((m) => ({
    id: m.id,
    name: m.name,
    available: m.excluded ? 0 : availableByPaper.get(m.id) || 0,
    used: 0,
  }));

  const colourDifferences: MaterialReport['colourDifferences'] = [];

  if (allocation) {
    if (typeof allocation.grid !== 'number' || allocation.grid !== grid) {
      throw new Error(`Allocation grid ${allocation.grid} != requested ${grid}`);
    }
    if (!Array.isArray(allocation.tileIds)) throw new Error('Allocation tileIds missing');
    if (allocation.tileIds.length !== required) {
      throw new Error(`Allocation length ${allocation.tileIds.length} != grid ${required}`);
    }
    const seen = new Set<string>();
    const usedByPaper = new Map<string, number>();
    let allocated = 0;
    for (const id of allocation.tileIds) {
      if (seen.has(id)) throw new Error(`Duplicate tile id ${id}`);
      seen.add(id);
      const tile = tiles.find((t) => t.id === id);
      if (!tile) throw new Error(`Unknown tile id ${id}`);
      if (!includedIds.has(tile.scrapId)) throw new Error(`Tile ${id} from excluded/unknown paper ${tile.scrapId}`);
      usedByPaper.set(tile.scrapId, (usedByPaper.get(tile.scrapId) || 0) + 1);
      allocated++;
    }
    for (const p of papers) p.used = usedByPaper.get(p.id) || 0;
    unused = available - allocated;

    if (target) {
      for (let i = 0; i < required; i++) {
        const tile = tiles.find((t) => t.id === allocation.tileIds[i])!;
        assertRgb(tile.color, `tile ${tile.id}`);
        colourDifferences.push({ position: i, sourceId: tile.id, distance: deltaE76(tile.color, target[i]) });
      }
    }
  }

  return { required, available, shortage, unused, papers, colourDifferences };
}
