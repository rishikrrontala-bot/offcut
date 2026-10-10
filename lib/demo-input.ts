import { SHEET, type Session, type Point, type RGB } from './types';

const COLORS: RGB[] = [
  [0xbc, 0x45, 0x32],
  [0xea, 0xae, 0x45],
  [0x3c, 0x82, 0x66],
  [0x44, 0x67, 0xaa],
];

function toHex(c: RGB): string {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(c[0])}${h(c[1])}${h(c[2])}`;
}

function floor(n: number): number {
  return Math.floor(n);
}

export function createIllustratedSession(): Session {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = SHEET.width;
  canvas.height = SHEET.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable for illustrated demo input');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SHEET.width, SHEET.height);

  for (let i = 0; i < 4; i++) {
    const ox = 70 + (i % 2) * 490;
    const oy = 80 + floor(i / 2) * 690;
    const vertices: Point[] = [
      { x: ox, y: oy },
      { x: ox + 380, y: oy + 15 },
      { x: ox + 360, y: oy + 550 },
      { x: ox + 50, y: oy + 560 },
    ];
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    ctx.lineTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[2].x, vertices[2].y);
    ctx.lineTo(vertices[3].x, vertices[3].y);
    ctx.closePath();
    ctx.fillStyle = toHex(COLORS[i]);
    ctx.fill();
  }

  const photo = canvas.toDataURL('image/png');

  return {
    version: 1,
    inputKind: 'illustration',
    photo,
    corners: [
      { x: 0, y: 0 },
      { x: 1050, y: 0 },
      { x: 1050, y: 1485 },
      { x: 0, y: 1485 },
    ],
    portraitConfirmed: true,
    rectified: '',
    masks: [],
    target: '',
    subject: '',
    grid: 6,
  };
}
