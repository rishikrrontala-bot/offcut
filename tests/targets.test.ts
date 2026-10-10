import { describe, it, expect } from 'vitest';
import { TARGET_DESIGNS, designCells } from '../lib/targets';
import type { RGB } from '../lib/types';
import type { TargetDesign } from '../lib/targets';

describe('targets', () => {
  const FG: RGB = [200, 10, 30];
  const BG: RGB = [245, 240, 230];

  describe('TARGET_DESIGNS', () => {
    it('exposes exactly heart, flower, bird with names', () => {
      expect(TARGET_DESIGNS.map((d) => d.id).sort()).toEqual(['bird', 'flower', 'heart']);
      for (const d of TARGET_DESIGNS) {
        expect(typeof d.name).toBe('string');
        expect(d.name.length).toBeGreaterThan(0);
      }
    });
  });

  describe('designCells dimensions and determinism', () => {
    const ids: TargetDesign[] = ['heart', 'flower', 'bird'];
    for (const id of ids) {
      for (const grid of [6, 8] as const) {
        it(`${id} ${grid}x${grid} produces grid*grid deterministic cells`, () => {
          const cells = designCells(id, grid, FG, BG);
          expect(cells.length).toBe(grid * grid);
          for (const c of cells) {
            expect(c.length).toBe(3);
            for (const v of c) expect(v).toBeGreaterThanOrEqual(0);
            for (const v of c) expect(v).toBeLessThanOrEqual(255);
          }
          const again = designCells(id, grid, FG, BG);
          expect(again).toEqual(cells);
        });
      }
    }
  });

  describe('recognizable foreground geometry', () => {
    const ids: TargetDesign[] = ['heart', 'flower', 'bird'];
    for (const grid of [6, 8] as const) {
      const size = grid * grid;
      const idx = (r: number, c: number) => r * grid + c;
      const fgCount = (cells: RGB[]) => cells.filter((c) => c[0] === FG[0] && c[1] === FG[1] && c[2] === FG[2]).length;

      for (const id of ids) {
        it(`${id} ${grid}x${grid} has sensible foreground shape`, () => {
          const cells = designCells(id, grid, FG, BG);
          const fg = fgCount(cells);
          // neither empty nor all-foreground
          expect(fg).toBeGreaterThan(0);
          expect(fg).toBeLessThan(size);

          // symmetry checks: heart and flower are horizontally symmetric, bird is not
          if (id === 'heart' || id === 'flower') {
            for (let r = 0; r < grid; r++) {
              for (let c = 0; c < Math.floor(grid / 2); c++) {
                expect(cells[idx(r, c)]).toEqual(cells[idx(r, grid - 1 - c)]);
              }
            }
          } else {
            // bird: beak on the right, tail on the left -> asymmetric
            let asymmetric = false;
            for (let r = 0; r < grid && !asymmetric; r++) {
              for (let c = 0; c < Math.floor(grid / 2); c++) {
                if (JSON.stringify(cells[idx(r, c)]) !== JSON.stringify(cells[idx(r, grid - 1 - c)])) {
                  asymmetric = true;
                  break;
                }
              }
            }
            expect(asymmetric).toBe(true);
          }
        });
      }

      it(`heart ${grid}x${grid} has a pointed bottom lobe`, () => {
        const cells = designCells('heart', grid, FG, BG);
        const last = grid - 1;
        const tipCol = Math.floor(grid / 2);
        // bottom-center tip foreground, corners background
        expect(cells[last * grid + tipCol]).toEqual(FG);
        expect(cells[last * grid]).toEqual(BG);
        expect(cells[last * grid + (grid - 1)]).toEqual(BG);
      });

      it(`flower ${grid}x${grid} has foreground near center and corners background`, () => {
        const cells = designCells('flower', grid, FG, BG);
        const mid = Math.floor(grid / 2);
        expect(cells[mid * grid + mid] ?? cells[(mid - 1) * grid + (mid - 1)]).toEqual(FG);
        expect(cells[0]).toEqual(BG);
        expect(cells[grid - 1]).toEqual(BG);
      });

      it(`bird ${grid}x${grid} has a right-side head/beak row and a left tail`, () => {
        const cells = designCells('bird', grid, FG, BG);
        const topRow = 0;
        // beak on the right of the top row
        expect(cells[topRow * grid + (grid - 1)]).toEqual(FG);
        // tail on the left side of the body row
        const bodyRow = grid >= 8 ? 3 : 2;
        expect(cells[bodyRow * grid]).toEqual(FG);
      });
    }
  });

  describe('validation', () => {
    it('throws on unsupported design id', () => {
      expect(() => designCells('nope' as TargetDesign, 6, FG, BG)).toThrow(/Unsupported target design id/);
    });
    it('throws on unsupported grid', () => {
      expect(() => designCells('heart', 7 as 6 | 8, FG, BG)).toThrow(/Unsupported grid size/);
    });
    it('throws on malformed foreground', () => {
      expect(() => designCells('heart', 6, [-1, 0, 0] as RGB, BG)).toThrow(/finite RGB/);
      expect(() => designCells('heart', 6, [0, 256, 0] as RGB, BG)).toThrow(/finite RGB/);
      expect(() => designCells('heart', 6, [0, 0] as unknown as RGB, BG)).toThrow(/finite RGB/);
    });
    it('throws on malformed background', () => {
      expect(() => designCells('heart', 6, FG, [NaN, 0, 0] as RGB)).toThrow(/finite RGB/);
    });
  });

  describe('immutability', () => {
    it('does not mutate inputs', () => {
      const fg: RGB = [10, 20, 30];
      const bg: RGB = [200, 210, 220];
      const fgSnap = [...fg];
      const bgSnap = [...bg];
      const cells = designCells('heart', 6, fg, bg);
      expect(fg).toEqual(fgSnap);
      expect(bg).toEqual(bgSnap);
      expect(cells.length).toBe(36);
    });

    it('returns independent cell arrays across calls (no shared cells)', () => {
      const a = designCells('flower', 6, FG, BG);
      const b = designCells('flower', 6, FG, BG);
      expect(a).not.toBe(b);
      for (let i = 0; i < a.length; i++) {
        expect(a[i]).not.toBe(b[i]);
      }
    });

    it('mutating output cells does not affect inputs or later outputs', () => {
      const fg: RGB = [11, 22, 33];
      const bg: RGB = [240, 230, 220];
      const a = designCells('bird', 8, fg, bg);
      a[0][0] = 999;
      const b = designCells('bird', 8, fg, bg);
      expect(b[0][0]).toBe(bg[0]);
      expect(fg).toEqual([11, 22, 33]);
      expect(bg).toEqual([240, 230, 220]);
    });
  });
});
