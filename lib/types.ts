export type Point = { x: number; y: number };
export type RGB = [number, number, number];
export type Mask = { id: string; name: string; color: RGB; width: number; height: number; data: Uint8Array; excluded: boolean };
export type Tile = { id: string; scrapId: string; x: number; y: number; size: number; color: RGB };
export type Allocation = { revision: number; grid: number; tileIds: string[]; cost: number };
export const SHEET = { width: 1050, height: 1485, pxPerMm: 5, tileMm: 12, marginMm: 1, pitchMm: 14 } as const;
export type Session = { version: 1; inputKind?:'illustration'; pattern?: {id:'heart'|'flower'|'bird';foreground:RGB;background:RGB}; portraitConfirmed?:boolean; photo: string; corners: Point[]; rectified: string; masks: {id:string;name:string;color:RGB;excluded:boolean;data:number[]}[]; target: string; subject: string; grid: number };
