import { describe, it, expect } from 'vitest';
import { materialReport } from '../lib/material-report';
import type { RGB, Tile, Mask, Allocation } from '../lib/types';

const c = (r: number, g: number, b: number): RGB => [r, g, b];
const mk = (id: string, scrapId: string, color: RGB): Tile => ({ id, scrapId, x: 0, y: 0, size: 60, color });
const mask = (id: string, name: string, excluded = false): Mask => ({
  id, name, color: c(0, 0, 0), width: 1, height: 1, data: new Uint8Array([0]), excluded,
});

describe('materialReport', () => {
  it('reports shortage when available < required', () => {
    const tiles = [mk('t1', 'p1', c(0, 0, 0))];
    const r = materialReport(tiles, [mask('p1', 'P1')], 6);
    expect(r.required).toBe(36);
    expect(r.available).toBe(1);
    expect(r.shortage).toBe(35);
    expect(r.unused).toBe(1);
  });

  it('unused is available minus allocated count after valid allocation', () => {
    const tiles = Array.from({ length: 40 }, (_, i) => mk(`t${i}`, 'p1', c(0, 0, 0)));
    const alloc: Allocation = { revision: 1, grid: 6, tileIds: tiles.slice(0, 36).map((t) => t.id), cost: 0 };
    const r = materialReport(tiles, [mask('p1', 'P1')], 6, alloc);
    expect(r.available).toBe(40);
    expect(r.unused).toBe(4);
  });

  it('excluded papers appear available0 used0; included counts unaffected', () => {
    const tiles = [mk('t1', 'p1', c(0, 0, 0))];
    const r = materialReport(tiles, [mask('p1', 'P1'), mask('p2', 'P2', true)], 6);
    expect(r.papers).toHaveLength(2);
    const p2 = r.papers.find((p) => p.id === 'p2')!;
    expect(p2.available).toBe(0);
    expect(p2.used).toBe(0);
    expect(r.available).toBe(1);
  });

  it('per-paper usage with valid allocation and source uniqueness', () => {
    const tiles = [
      ...Array.from({ length: 18 }, (_, i) => mk(`a${i}`, 'p1', c(0, 0, 0))),
      ...Array.from({ length: 18 }, (_, i) => mk(`b${i}`, 'p2', c(0, 0, 0))),
    ];
    const alloc: Allocation = {
      revision: 1, grid: 6,
      tileIds: [...Array.from({ length: 18 }, (_, i) => `a${i}`), ...Array.from({ length: 18 }, (_, i) => `b${i}`)],
      cost: 0,
    };
    const r = materialReport(tiles, [mask('p1', 'P1'), mask('p2', 'P2')], 6, alloc);
    expect(r.papers.find((p) => p.id === 'p1')!.used).toBe(18);
    expect(r.papers.find((p) => p.id === 'p2')!.used).toBe(18);
  });

  it('colour differences only with allocation+target; identical colours zero distance', () => {
    const col: RGB = c(128, 64, 200);
    const tiles = Array.from({ length: 36 }, (_, i) => mk(`t${i}`, 'p1', col));
    const alloc: Allocation = { revision: 1, grid: 6, tileIds: tiles.map((t) => t.id), cost: 0 };
    const target = Array.from({ length: 36 }, () => col);
    const r = materialReport(tiles, [mask('p1', 'P1')], 6, alloc, target);
    expect(r.colourDifferences).toHaveLength(36);
    expect(r.colourDifferences.every((d) => d.distance === 0)).toBe(true);
  });

  it('target validated without allocation; no colourDifferences emitted', () => {
    const tiles = Array.from({ length: 36 }, (_, i) => mk(`t${i}`, 'p1', c(0, 0, 0)));
    const target = Array.from({ length: 36 }, () => c(0, 0, 0));
    const r = materialReport(tiles, [mask('p1', 'P1')], 6, undefined, target);
    expect(r.colourDifferences).toHaveLength(0);
  });

  it('errors on target length mismatch without allocation', () => {
    const tiles = [mk('t1', 'p1', c(0, 0, 0))];
    expect(() => materialReport(tiles, [mask('p1', 'P1')], 6, undefined, [c(0, 0, 0)])).toThrow();
  });

  it('errors on invalid RGB in target without allocation', () => {
    const tiles = [mk('t1', 'p1', c(0, 0, 0))];
    const target = Array.from({ length: 36 }, () => c(0, 0, 0));
    target[0] = c(-1, 0, 0);
    expect(() => materialReport(tiles, [mask('p1', 'P1')], 6, undefined, target)).toThrow();
  });

  it('errors when allocation.grid != requested grid', () => {
    const tiles = Array.from({ length: 36 }, (_, i) => mk(`t${i}`, 'p1', c(0, 0, 0)));
    const alloc: Allocation = { revision: 1, grid: 8, tileIds: tiles.map((t) => t.id), cost: 0 };
    expect(() => materialReport(tiles, [mask('p1', 'P1')], 6, alloc)).toThrow();
  });

  it('errors on duplicate mask id', () => {
    expect(() => materialReport([mk('t1', 'p1', c(0, 0, 0))], [mask('p1', 'P1'), mask('p1', 'Dup')], 6)).toThrow();
  });

  it('errors on duplicate tile id in allocation', () => {
    const tiles = Array.from({ length: 36 }, (_, i) => mk(`t${i}`, 'p1', c(0, 0, 0)));
    const ids = tiles.map((t) => t.id);
    ids[1] = ids[0];
    const alloc: Allocation = { revision: 1, grid: 6, tileIds: ids, cost: 0 };
    expect(() => materialReport(tiles, [mask('p1', 'P1')], 6, alloc)).toThrow();
  });

  it('errors on unknown allocation tile id', () => {
    const tiles = Array.from({ length: 36 }, (_, i) => mk(`t${i}`, 'p1', c(0, 0, 0)));
    const ids = tiles.map((t) => t.id);
    ids[0] = 'nope';
    const alloc: Allocation = { revision: 1, grid: 6, tileIds: ids, cost: 0 };
    expect(() => materialReport(tiles, [mask('p1', 'P1')], 6, alloc)).toThrow();
  });

  it('errors on allocation length mismatch', () => {
    const tiles = Array.from({ length: 36 }, (_, i) => mk(`t${i}`, 'p1', c(0, 0, 0)));
    const alloc: Allocation = { revision: 1, grid: 6, tileIds: tiles.slice(0, 35).map((t) => t.id), cost: 0 };
    expect(() => materialReport(tiles, [mask('p1', 'P1')], 6, alloc)).toThrow();
  });

  it('errors on unknown tile scrapId', () => {
    const tiles = [mk('t1', 'unknown', c(0, 0, 0))];
    expect(() => materialReport(tiles, [mask('p1', 'P1')], 6)).toThrow();
  });

  it('ignores excluded known inventory, rejects duplicate inventory and unsupported grids',()=>{const tiles=[mk('t1','p1',c(0,0,0)),mk('t2','p2',c(0,0,0))],masks=[mask('p1','P1'),mask('p2','P2',true)];expect(materialReport(tiles,masks,6).available).toBe(1);expect(()=>materialReport([tiles[0],tiles[0]],masks,6)).toThrow();expect(()=>materialReport(tiles,masks,7)).toThrow();});
});
