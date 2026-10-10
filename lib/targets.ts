import type { RGB } from './types';
export type TargetDesign = 'heart' | 'flower' | 'bird';

export const TARGET_DESIGNS: { id: TargetDesign; name: string }[] = [
  { id: 'heart', name: 'Heart' },
  { id: 'flower', name: 'Flower' },
  { id: 'bird', name: 'Bird' },
];

const VALID_IDS: ReadonlySet<TargetDesign> = new Set(['heart', 'flower', 'bird']);
const VALID_GRIDS: ReadonlySet<6 | 8> = new Set([6, 8]);

function cloneRGB(c: RGB): RGB {
  return [c[0], c[1], c[2]];
}

// Hand-authored foreground (1) / background (0) masks.
// Row-major, top-to-bottom, left-to-right. Stable designed patterns.
const PATTERN: Record<TargetDesign, Record<6 | 8, number[]>> = {
  heart: {
    6: [
      0,1,0,0,1,0,
      1,1,1,1,1,1,
      1,1,1,1,1,1,
      0,1,1,1,1,0,
      0,0,1,1,0,0,
      0,0,1,1,0,0,
    ],
    8: [
      0,1,1,0,0,1,1,0,
      1,1,1,1,1,1,1,1,
      1,1,1,1,1,1,1,1,
      1,1,1,1,1,1,1,1,
      0,1,1,1,1,1,1,0,
      0,0,1,1,1,1,0,0,
      0,0,0,1,1,0,0,0,
      0,0,0,1,1,0,0,0,
    ],
  },
  flower: {
    6: [
      0,0,1,1,0,0,
      0,1,1,1,1,0,
      1,1,1,1,1,1,
      1,1,1,1,1,1,
      0,1,0,0,1,0,
      0,0,1,1,0,0,
    ],
    8: [
      0,1,1,0,0,1,1,0,
      1,1,1,1,1,1,1,1,
      0,1,1,1,1,1,1,0,
      0,1,1,1,1,1,1,0,
      1,1,1,1,1,1,1,1,
      0,1,0,1,1,0,1,0,
      0,0,0,1,1,0,0,0,
      0,0,0,1,1,0,0,0,
    ],
  },
  bird: {
    6: [
      0,0,0,0,1,1,
      0,0,0,1,1,1,
      1,1,1,1,1,0,
      0,1,1,1,0,0,
      0,0,1,1,0,0,
      0,0,1,0,0,0,
    ],
    8: [
      0,0,0,0,0,1,1,1,
      0,0,0,0,1,1,1,1,
      0,0,0,1,1,1,1,1,
      1,1,1,1,1,1,1,0,
      0,1,1,1,1,1,0,0,
      0,0,1,1,1,0,0,0,
      0,0,0,1,1,0,0,0,
      0,0,0,1,0,0,0,0,
    ],
  },
};

function isRGBArray(x: unknown): x is RGB[] {
  if (!Array.isArray(x)) return false;
  for (const c of x) {
    if (!Array.isArray(c) || c.length !== 3) return false;
    for (const v of c) {
      if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 255) return false;
    }
  }
  return true;
}

export function designCells(
  id: TargetDesign,
  grid: 6 | 8,
  foreground: RGB,
  background: RGB,
): RGB[] {
  if (!VALID_IDS.has(id)) {
    throw new Error(`Unsupported target design id: ${String(id)}`);
  }
  if (!VALID_GRIDS.has(grid)) {
    throw new Error(`Unsupported grid size: ${String(grid)} (expected 6 or 8)`);
  }
  if (!isRGBArray([foreground, background])) {
    throw new Error('foreground and background must be finite RGB triplets in 0..255');
  }

  const fg = cloneRGB(foreground);
  const bg = cloneRGB(background);
  const mask = PATTERN[id][grid];
  const cells: RGB[] = new Array(mask.length);
  for (let i = 0; i < mask.length; i++) {
    cells[i] = mask[i] === 1 ? cloneRGB(fg) : cloneRGB(bg);
  }
  return cells;
}
