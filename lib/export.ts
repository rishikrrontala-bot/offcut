import type { Allocation, Mask, Tile } from './types';
import { SHEET } from './types';
import { validateAllocation } from './engine';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

const n = (v: number): string => String(Number(v.toFixed(3)));

export function assertSafePhotoDataUrl(url: string): void {
  if (!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+\/=]+$/.test(url)) {
    throw new Error('Photo must be a base64 PNG or JPEG data URL');
  }
}

function pageOpen(title: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{size:A4;margin:10mm}body{margin:0}.page{width:190mm;min-height:277mm;box-sizing:border-box;padding:4mm;page-break-after:always}.page:last-child{page-break-after:auto}h1{font:700 14pt sans-serif;margin:0 0 3mm}p,td,th,li{font:9pt sans-serif}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:1mm 2mm;text-align:left}svg{display:block}.calibration-row{display:flex;align-items:center;gap:4mm;margin:4mm 0}.calibration-row svg{flex:none}.example-disclaimer{background:#fff3cd;border:1px solid #ffc107;padding:2mm 3mm;margin:0 0 4mm;font:700 9pt sans-serif;color:#664d03}</style></head><body>\n`;
}
const pageClose = '</body></html>';

function tileMap(tiles: Tile[]): Map<string, Tile> {
  return new Map(tiles.map(t => [t.id, t]));
}

function assemblyPage(alloc: Allocation, used: Tile[], photo: string): string {
  const grid = alloc.grid;
  const W = grid === 6 ? 72 : 96;
  const cells = used.map((t, i) => {
    const col = i % grid, row = Math.floor(i / grid);
    return `<g data-role="assembly-piece" data-tile-id="${esc(t.id)}" data-source-id="${i+1}"><svg x="${n(col * 12)}" y="${n(row * 12)}" width="12" height="12" viewBox="${n(t.x)} ${n(t.y)} ${n(t.size)} ${n(t.size)}"><use href="#offcut-source-photo"/></svg><rect x="${col*12}" y="${row*12}" width="12" height="12" fill="none" stroke="#333" stroke-width="0.15"/><text x="${col*12+1}" y="${row*12+3}" font-size="2.5" fill="white" stroke="black" stroke-width="0.2" paint-order="stroke">${i+1}</text></g>`;
  });
  return `
<div class="page"><h1>Assembly plan — grid ${grid} (${used.length} pieces)</h1>
<p>Each square below is one finished ${SHEET.tileMm}mm piece. Print at 100% (actual size), disable fit-to-page. Verify with the 20mm calibration square on the first page.</p>
<svg width="${W}mm" height="${W}mm" viewBox="0 0 ${W} ${W}">
<rect x="0" y="0" width="${W}" height="${W}" fill="none" stroke="#000" stroke-width="0.3"/>
${cells.join('\n')}
</svg>
<p>Numbers run left-to-right, top-to-bottom and match the Source ID column in the ID table.</p>
</div>\n`;
}

export function primaryPage(t:Tile):number {
 const index=[[0,0],[90,0],[0,128.5],[90,128.5]].findIndex(([x,y])=>t.x>=x*5&&t.y>=y*5&&t.x+t.size<=(x+120)*5&&t.y+t.size<=(y+168.5)*5);
 if(index<0)throw new Error('A source piece cannot fit a full actual-size viewport.');return index;
}

function sourcePages(alloc: Allocation, used: Tile[], photo: string): string {
  const PW = 120, PH = 168.5;
  const offs: Array<[number, number]> = [[0,0],[90,0],[0,128.5],[90,128.5]];
  let out = '';
  offs.forEach(([ox, oy], pi) => {
    const on = used.filter(t => primaryPage(t)===pi);
    if (on.length === 0) return;
    const labels = on.map(t =>
      `<g data-role="cutting-piece" data-tile-id="${esc(t.id)}" data-source-id="${used.indexOf(t)+1}"><rect x="${n(t.x)}" y="${n(t.y)}" width="${n(t.size)}" height="${n(t.size)}" fill="none" stroke="#f00" stroke-width="2"/>` +
      `<text x="${n(t.x + 4)}" y="${n(t.y + 20)}" font-size="18" fill="#f00" font-family="sans-serif">${used.indexOf(t)+1}</text></g>`);
    out += `
<div class="page"><h1>Source page ${pi + 1} of 4 — sheet region x=${ox}mm y=${oy}mm</h1>
<p>Cut each numbered piece once from your real paper, not this printout. Images overlap for context; every cutting number is marked on exactly one primary page. Locate this region using the sheet offsets and locator below.</p>
<svg width="${PW}mm" height="${PH}mm" viewBox="${n(ox * SHEET.pxPerMm)} ${n(oy * SHEET.pxPerMm)} 600 842.5">
<use href="#offcut-source-photo"/>
${labels.join('\n')}
<rect x="${n(ox * SHEET.pxPerMm)}" y="${n(oy * SHEET.pxPerMm)}" width="600" height="842.5" fill="none" stroke="#000" stroke-width="1"/>
</svg>
<p>Locator (not to scale):</p>
<svg width="30mm" height="42.4mm" viewBox="0 0 210 297">
<g transform="scale(.2)"><use href="#offcut-source-photo"/></g>
<rect x="${n(ox)}" y="${n(oy)}" width="${PW}" height="${PH}" fill="none" stroke="#00f" stroke-width="2"/>
</svg>
</div>\n`;
  });
  return out;
}

function idPages(alloc: Allocation, used: Tile[]): string {
  const rows = used.map((t, i) =>
    `<tr><td>${i + 1}</td><td>${esc(t.id)}</td><td>${esc(t.scrapId)}</td><td>${n(t.x / SHEET.pxPerMm)}</td><td>${n(t.y / SHEET.pxPerMm)}</td><td>${primaryPage(t)+1}</td></tr>`);
  const per = 32;
  let out = '';
  for (let p = 0; p < rows.length; p += per) {
    out += `
<div class="page"><h1>ID table — Source ID ↔ original tile</h1>
<table><tr><th>Source ID</th><th>Tile ID</th><th>Scrap ID</th><th>Sheet x (mm)</th><th>Sheet y (mm)</th><th>Cutting page</th></tr>
${rows.slice(p, p + per).join('\n')}
</table></div>\n`;
  }
  return out;
}

function calibrationPage(): string {
  return `
<div class="page"><h1>Start here — print calibration</h1>
<p>Print at 100% actual size. Measure the square below: it must be exactly 20mm per side. If not, adjust printer scaling.</p>
<div class="calibration-row"><svg width="20mm" height="20mm" viewBox="0 0 20 20"><rect x="0" y="0" width="20" height="20" fill="none" stroke="#000" stroke-width="0.2"/></svg><p style="margin:0">20mm</p></div>
<p>Cmd/Ctrl+P · Actual size 100% · Disable fit-to-page.</p>
<ol><li>Print this page first at 100%, with fit-to-page disabled.</li><li>Measure the square with a ruler: both sides must be 20 mm. Adjust printer scaling if they differ.</li><li>Print the remaining pages at the same setting. Source maps show positions on your real A4 sheet.</li><li>Cut the numbered 12 mm squares from the photographed paper. Each cutting number belongs to one page.</li><li>Arrange the pieces left to right, top to bottom, following the assembly numbers. Glue them to backing paper.</li></ol><p>Built by Rishik Rontala</p>
</div>\n`;
}

function insertDisclaimers(html: string): string {
  const disclaimer = '<div class="example-disclaimer">ILLUSTRATED EXAMPLE — synthetic input. No camera photograph or physical assembly verified.</div>';
  return html.replace(/<div class="page">/g, '<div class="page">' + disclaimer);
}

export function makePrintPlan(alloc: Allocation, tiles: Tile[], masks: Mask[], revision: number, photo: string, inputKind?: 'illustration'): string {
  validateAllocation(alloc, tiles, masks, revision);
  assertSafePhotoDataUrl(photo);
  const used = alloc.tileIds.map(id => {
    const t = tiles.find(t => t.id === id);
    if (!t) throw new Error(`Missing tile ${id}`);
    return t;
  });
  const covered=(t:Tile)=>[[0,0],[90,0],[0,128.5],[90,128.5]].some(([x,y])=>t.x>=x*5&&t.y>=y*5&&t.x+t.size<=(x+120)*5&&t.y+t.size<=(y+168.5)*5);
  if(!used.every(covered))throw new Error('A source piece cannot fit a full actual-size viewport.');
  const expected = alloc.grid === 6 ? 36 : alloc.grid === 8 ? 64 : 0;
  if (used.length !== expected) throw new Error(`Expected ${expected} tiles for grid ${alloc.grid}, got ${used.length}`);
  const defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><image id="offcut-source-photo" href="${esc(photo)}" x="0" y="0" width="1050" height="1485"/></defs></svg>`;
  const plan = pageOpen(`Print plan rev ${revision}`) +
    defs +
    calibrationPage() +
    assemblyPage(alloc, used, photo) +
    sourcePages(alloc, used, photo) +
    idPages(alloc, used) +
    pageClose;
  return inputKind === 'illustration' ? insertDisclaimers(plan) : plan;
}
