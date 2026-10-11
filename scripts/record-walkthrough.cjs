#!/usr/bin/env node
'use strict';
/*
 * OFFCUT labelled engineering walkthrough recorder (GLM-only).
 *
 *   node scripts/record-walkthrough.cjs --rehearse   verify every selector end-to-end, save receipt
 *   node scripts/record-walkthrough.cjs --record      require rehearsal receipt, narrate, record WebM, mux MP4
 *   node scripts/record-walkthrough.cjs --assemble    re-run ffmpeg mux/verify from saved artifacts
 *
 * Honest scope: records the live app using the built-in illustrated example and real in-browser
 * segmentation. NOT a camera photograph, NOT a verified physical result, NOT published anywhere.
 * Physical cutting/real success remains unverified. Built by Rishik Rontala.
 */

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { chromium } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3037';
const ROOT = path.resolve(__dirname, '..');
const ART = path.join(ROOT, 'artifacts', 'walkthrough');
const VOICE_DIR = path.join(ART, 'voice');
const NARRATION_PATH = path.join(ROOT, 'submission', 'WALKTHROUGH-NARRATION.json');
const RECEIPT_PATH = path.join(ART, 'rehearsal-receipt.json');
const WEBM_PATH = path.join(ART, 'engineering-walkthrough.webm');
const MP4_PATH = path.join(ART, 'engineering-walkthrough.mp4');
const MANIFEST_PATH = path.join(ART, 'manifest.json');
const PLAN_HTML_PATH = path.join(ART, 'offcut-example-plan.html');
const TIMING_PATH = path.join(ART, 'scene-timing.json');

const FFMPEG =
  '/Library/Frameworks/Python.framework/Versions/3.14/lib/python3.14/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1';
const SAY = '/usr/bin/say';

const VIEWPORT = { width: 1280, height: 720 };
const MAX_TOTAL_SECONDS = 165;
const MIN_TOTAL_SECONDS = 125;
// Per-scene hold after narration finishes: paces useful UI scenes into the 125-165s band.
const PACE_TAIL_SECONDS = 6.0;
const MIN_PAUSE_MS = 800;
const DETECT_TIMEOUT_MS = 190000;

const PERSISTENT_BADGE = 'Illustrated input · real segmentation · physical result unverified';

function fail(message) {
  console.error('WALKTHROUGH FAILED: ' + message);
  process.exit(1);
}

function parseArgs() {
  const flags = { rehearse: false, record: false, assemble: false, resynthesize: false };
  for (const arg of process.argv.slice(2)) {
    if (arg === '--rehearse') flags.rehearse = true;
    else if (arg === '--record') flags.record = true;
    else if (arg === '--assemble') flags.assemble = true;
    else if (arg === '--resynthesize') flags.resynthesize = true;
    else fail('Unknown argument: ' + arg);
  }
  const chosen = [flags.rehearse, flags.record, flags.assemble].filter(Boolean).length;
  if (chosen !== 1) fail('Choose exactly one of --rehearse, --record, --assemble');
  return flags;
}

function loadNarration() {
  if (!fs.existsSync(NARRATION_PATH)) fail('Missing ' + NARRATION_PATH);
  const data = JSON.parse(fs.readFileSync(NARRATION_PATH, 'utf8'));
  if (data.badge !== PERSISTENT_BADGE) fail('Narration badge text mismatch');
  if (!Array.isArray(data.scenes) || data.scenes.length !== 11) fail('Narration must contain exactly 11 scenes');
  for (const s of data.scenes) {
    if (!s.id || !s.caption || !s.narration) fail('Scene missing id/caption/narration');
    if (s.caption !== s.narration) fail('Caption must match narration for scene ' + s.id);
    const sentences = s.caption.split(/[.!?]+\s*/).filter(Boolean);
    if (sentences.length > 2) fail('Scene ' + s.id + ' caption exceeds two sentences');
  }
  return data;
}

function ffmpegDurationSeconds(file) {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (!m) fail('Cannot read duration of ' + file);
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + parseFloat(m[3]);
}

function ensureExecutable(p, label) {
  if (!fs.existsSync(p)) fail(label + ' not found at ' + p);
}

function synthesizeVoice(scenes, force) {
  ensureExecutable(SAY, 'say');
  fs.mkdirSync(VOICE_DIR, { recursive: true });
  const out = [];
  for (const s of scenes) {
    const file = path.join(VOICE_DIR, s.id + '.aiff');
    if (force || !fs.existsSync(file)) {
      const r = spawnSync(SAY, ['-o', file, s.narration]);
      if (r.status !== 0 || !fs.existsSync(file)) {
        fail('say failed for scene ' + s.id + ': ' + (r.stderr || '').toString().trim());
      }
    }
    out.push({ id: s.id, caption: s.caption, audio: file, durationMs: Math.round(ffmpegDurationSeconds(file) * 1000) });
  }
  return out;
}

const OVERLAY_CSS = `
#offcut-badge{position:fixed;top:14px;right:16px;z-index:2147483000;background:rgba(16,15,13,.84);color:#F4F1EA;font:500 13px/1.25 system-ui,sans-serif;padding:7px 12px;border-radius:6px;pointer-events:none;letter-spacing:.02em;white-space:nowrap}
#offcut-caption{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:2147483000;max-width:1080px;background:rgba(16,15,13,.88);color:#FFFFFF;font:600 20px/1.35 system-ui,sans-serif;padding:10px 18px;border-radius:8px;text-align:center;pointer-events:none}
#offcut-cursor{position:fixed;left:0;top:0;z-index:2147483001;pointer-events:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.55));transition:transform 8ms linear}
`;

const CURSOR_SVG =
  '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2l7 18 2.5-7.5L21 10z" fill="#DA532C" stroke="#F4F1EA" stroke-width="1.5"/></svg>';

async function injectOverlays(page, caption) {
  await page.addStyleTag({ content: OVERLAY_CSS });
  await page.evaluate(
    ({ badge, caption, cursorSvg }) => {
      if (!document.getElementById('offcut-badge')) {
        const b = document.createElement('div');
        b.id = 'offcut-badge';
        b.textContent = badge;
        document.documentElement.appendChild(b);
      }
      let capEl = document.getElementById('offcut-caption');
      if (!capEl) {
        capEl = document.createElement('div');
        capEl.id = 'offcut-caption';
        document.documentElement.appendChild(capEl);
      }
      capEl.textContent = caption;
      let cur = document.getElementById('offcut-cursor');
      if (!cur) {
        cur = document.createElement('div');
        cur.id = 'offcut-cursor';
        cur.innerHTML = cursorSvg;
        cur.style.transform = 'translate(' + window.innerWidth / 2 + 'px,' + window.innerHeight / 2 + 'px)';
        document.documentElement.appendChild(cur);
        window.addEventListener('mousemove', (e) => {
          cur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
        });
      }
    },
    { badge: PERSISTENT_BADGE, caption, cursorSvg: CURSOR_SVG }
  );
}

async function setCaption(page, caption) {
  await page.evaluate((text) => {
    const el = document.getElementById('offcut-caption');
    if (el) el.textContent = text;
  }, caption);
}

async function requireVisible(page, selector, label) {
  let el;
  if (selector.startsWith('text=')) el = page.getByText(selector.slice(5), { exact: true });
  else if (selector.startsWith('role:')) {
    const [role, name] = selector.slice(5).split('|');
    el = page.getByRole(role, name ? { name, exact: true } : undefined);
  } else el = page.locator(selector);
  try {
    await el.first().scrollIntoViewIfNeeded({ timeout: 5000 });
    await expectVisible(el.first());
  } catch (e) {
    fail('Selector not visible: ' + selector + ' (' + label + ')');
  }
  return el.first();
}

async function expectVisible(el) {
  if (!(await el.isVisible())) throw new Error('not visible');
}

async function moveAndClick(page, el) {
  const box = await el.boundingBox();
  if (!box) fail('Cannot get bounding box for click target');
  const target = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const start = await page.evaluate(() => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const x = start.x + (target.x - start.x) * (i / steps);
    const y = start.y + (target.y - start.y) * (i / steps);
    await page.mouse.move(x, y, { steps: 1 });
  }
  await page.mouse.move(target.x, target.y);
  await el.click({ timeout: 10000 });
}

async function smoothScroll(page, el) {
  await el.scrollIntoViewIfNeeded({ timeout: 5000 });
  await page.waitForTimeout(400);
}

// Frame the complete result, rather than the lower controls that triggered it.
// Geometry assertions catch an off-screen collage before a recording is accepted.
async function frameCollage(page) {
  const jump = page.getByRole('link', { name: 'View collage', exact: true });
  await jump.click();
  const grid = page.locator('.art-grid');
  await grid.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(400);
  const box = await grid.boundingBox();
  const caption = await page.locator('#offcut-caption').boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport || box.y < 50 || box.x < 0 ||
      box.x + box.width > viewport.width ||
      box.y + box.height > Math.min(viewport.height - 40, caption ? caption.y - 12 : viewport.height - 130)) {
    fail('Full collage is outside the visible frame or obscured by captions');
  }
}

async function runFlow(page, { record, scenes, voiceMap, timing, videoStart }) {
  // t0 must match the video-recording clock: Playwright recordVideo starts at page creation,
  // so record() passes videoStart captured immediately after launchBrowser. Without this,
  // scene timestamps (and the adelay'd narration) drift late by the initial page-load time.
  const t0 = videoStart || Date.now();
  const timeline = [];
  let sceneIndex = 0;

  async function sceneStart() {
    const start = (Date.now() - t0) / 1000;
    const s = scenes[sceneIndex];
    await injectOverlays(page, s.caption);
    if (record) await setCaption(page, s.caption);
    return { start, scene: s, voice: voiceMap ? voiceMap[sceneIndex] : null };
  }

  async function sceneEnd(ctx, pauseMs) {
    const end = (Date.now() - t0) / 1000;
    let holdUntil = end;
    if (record && ctx.voice) {
      const needed = ctx.start + ctx.voice.durationMs / 1000 + (record ? PACE_TAIL_SECONDS : 0.4);
      holdUntil = Math.max(end, needed);
      while ((Date.now() - t0) / 1000 < holdUntil) await page.waitForTimeout(100);
    }
    timeline.push({ id: ctx.scene.id, start: +ctx.start.toFixed(3), end: +holdUntil.toFixed(3), caption: ctx.scene.caption });
    sceneIndex++;
    if (pauseMs) await page.waitForTimeout(pauseMs);
  }

  // Scene 1 — Intro / open app
  {
    const ctx = await sceneStart();
    await requireVisible(page, '.intro h1', 'h1 intro');
    await page.waitForTimeout(record ? 2500 : 200);
    await sceneEnd(ctx, MIN_PAUSE_MS);
  }

  // Scene 2 — Try illustrated example
  {
    const ctx = await sceneStart();
    const btn = await requireVisible(page, 'role:button|Try illustrated example', 'try example');
    await moveAndClick(page, btn);
    await requireVisible(page, '.original-photo', 'original photo svg');
    await requireVisible(page, 'role:button|Confirm corners & detect scraps', 'detect button');
    await page.waitForTimeout(record ? 1500 : 200);
    await sceneEnd(ctx, MIN_PAUSE_MS);
  }

  // Scene 3 — Confirm corners & detect scraps (real segmentation, up to 190s)
  {
    const ctx = await sceneStart();
    const btn = await requireVisible(page, 'role:button|Confirm corners & detect scraps', 'detect button');
    await moveAndClick(page, btn);
    await page.locator('.material-row').first().waitFor({ state: 'visible', timeout: DETECT_TIMEOUT_MS });
    const count = await page.locator('.material-row').count();
    if (count !== 4) fail('Expected 4 material rows, got ' + count);
    await requireVisible(page, '.material-list', 'material list');
    await page.waitForTimeout(record ? 800 : 200);
    await sceneEnd(ctx, MIN_PAUSE_MS);
  }

  // Scene 4 — Show actual mask map and mandatory review
  {
    const ctx = await sceneStart();
    await requireVisible(page, '.material-row', 'material rows');
    await requireVisible(page, '#review h2', 'review heading');
    await requireVisible(page, 'role:checkbox|I’ve checked the boundaries against the paper.', 'review checkbox');
    await smoothScroll(page, page.locator('.material-panel'));
    await page.waitForTimeout(record ? 1200 : 200);
    await sceneEnd(ctx, MIN_PAUSE_MS);
  }

  // Scene 5 — Check actual review checkbox
  {
    const ctx = await sceneStart();
    const cb = await requireVisible(page, 'role:checkbox|I’ve checked the boundaries against the paper.', 'review checkbox');
    await moveAndClick(page, cb);
    if (!(await cb.isChecked())) fail('Review checkbox not checked after click');
    await page.waitForTimeout(record ? 1000 : 200);
    await sceneEnd(ctx, MIN_PAUSE_MS);
  }

  // Scene 6 — Choose Heart and Make my collage (36 unique crops)
  {
    const ctx = await sceneStart();
    const heart = await requireVisible(page, 'role:button|Heart', 'heart button');
    await moveAndClick(page, heart);
    await requireVisible(page, 'text=Designed pattern ready. The collage will use only your actual paper.', 'design ready status');
    const make = await requireVisible(page, 'role:button|Make my collage', 'make collage');
    await moveAndClick(page, make);
    await page.locator('.art-tile').first().waitFor({ state: 'visible', timeout: 30000 });
    const tileCount = await page.locator('.art-tile').count();
    if (tileCount !== 36) fail('Expected 36 art tiles, got ' + tileCount);
    await frameCollage(page);
    await page.waitForTimeout(record ? 1200 : 200);
    await sceneEnd(ctx, MIN_PAUSE_MS);
  }

  // Scene 7 — Click piece trace + Show original-photo location
  {
    const ctx = await sceneStart();
    const tile = await requireVisible(page, '.art-tile', 'first art tile');
    await moveAndClick(page, tile);
    await requireVisible(page, '.trace-note', 'trace note');
    const showBtn = await requireVisible(page, 'role:button|Show original-photo location', 'show original button');
    await moveAndClick(page, showBtn);
    await requireVisible(page, '[data-testid="original-trace"]', 'original trace polygon');
    await frameCollage(page);
    await page.waitForTimeout(record ? 1200 : 200);
    await sceneEnd(ctx, MIN_PAUSE_MS);
  }

  // Scene 8 — Hide piece numbers
  {
    const ctx = await sceneStart();
    const hide = await requireVisible(page, 'role:button|Hide piece numbers', 'hide numbers button');
    await moveAndClick(page, hide);
    await frameCollage(page);
    await page.waitForTimeout(record ? 900 : 200);
    await sceneEnd(ctx, MIN_PAUSE_MS);
  }

  // Remove a real inventory item and show the automatically recomputed result.
  {
    const ctx = await sceneStart();
    const before = Number((await page.locator('.panel-foot span').first().innerText()).match(/\d+/)?.[0]);
    const remove = await requireVisible(page, 'role:button|Exclude Paper 1', 'exclude a paper');
    await moveAndClick(page, remove);
    await page.waitForFunction(() => {
      const cells = Array.from(document.querySelectorAll('.art-tile'));
      return cells.length === 36 && cells.every(el => !(el.getAttribute('aria-label') || '').includes('scrap-1'));
    });
    const after = Number((await page.locator('.panel-foot span').first().innerText()).match(/\d+/)?.[0]);
    if (!Number.isFinite(before) || !Number.isFinite(after) || after >= before) {
      fail('Removing a paper did not reduce the available inventory');
    }
    await requireVisible(page, 'role:button|Include Paper 1', 'excluded paper confirmation');
    await frameCollage(page);
    await sceneEnd(ctx, MIN_PAUSE_MS);
  }

  // Scene 9 — Download cutting/assembly HTML and display it; inspect 20mm calibration
  {
    const ctx = await sceneStart();
    const dl = await requireVisible(page, 'role:button|Download cutting & assembly plans', 'download plans');
    const [download] = await Promise.all([page.waitForEvent('download'), moveAndClick(page, dl)]);
    const file = await download.path();
    if (!file) fail('Download path not available');
    const html = fs.readFileSync(file, 'utf8');
    fs.mkdirSync(ART, { recursive: true });
    fs.writeFileSync(PLAN_HTML_PATH, html);
    if (!html.includes('20mm') && !html.includes('width="20mm"')) fail('Plan HTML missing 20mm calibration');
    // Display exported HTML in recorded page, then reinject overlays (setContent destroys them)
    await page.setContent(html);
    await injectOverlays(page, ctx.scene.caption);
    await requireVisible(page, '.calibration-row', 'calibration row');
    await requireVisible(page, 'text=20mm', '20mm label');
    await page.waitForTimeout(record ? 1800 : 200);
    await sceneEnd(ctx, MIN_PAUSE_MS);
  }

  // Scene 10 — Credits and limitations
  {
    const ctx = await sceneStart();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await injectOverlays(page, ctx.scene.caption);
    await requireVisible(page, 'text=Built by Rishik Rontala', 'credits link');
    await smoothScroll(page, page.locator('footer'));
    await page.waitForTimeout(record ? 2500 : 200);
    const total = (Date.now() - t0) / 1000;
    if (total > MAX_TOTAL_SECONDS) fail('Total duration ' + total.toFixed(1) + 's exceeds ' + MAX_TOTAL_SECONDS + 's');
    // B2 fix: instead of aborting below the 125s floor, hold the final credits scene
    // live until the minimum duration is met. This is a real on-screen hold of the
    // actual UI, not padding of export footage and not a lowered floor.
    if (record && total < MIN_TOTAL_SECONDS) {
      const holdMs = Math.round((MIN_TOTAL_SECONDS - total) * 1000) + 250;
      await page.waitForTimeout(holdMs);
    }
    await sceneEnd(ctx, 0);
  }

  return timeline;
}

async function launchBrowser(record) {
  const contextOptions = {
    viewport: VIEWPORT,
    recordVideo: record ? { dir: ART, size: VIEWPORT } : undefined,
  };
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--mute-audio'],
  });
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  return { browser, context, page };
}

async function rehearse() {
  const narration = loadNarration();
  fs.mkdirSync(ART, { recursive: true });
  console.log('Rehearsing walkthrough against ' + BASE_URL);
  const { browser, page } = await launchBrowser(false);
  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const timeline = await runFlow(page, { record: false, scenes: narration.scenes, voiceMap: null, timing: null });
    const receipt = {
      baseUrl: BASE_URL,
      timestamp: new Date().toISOString(),
      scenes: narration.scenes.map((s) => s.id),
      selectorCheck: 'all-visible',
      timeline,
    };
    fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2));
    console.log('Rehearsal OK. Receipt saved: ' + RECEIPT_PATH);
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

async function record() {
  const narration = loadNarration();
  if (!fs.existsSync(RECEIPT_PATH)) fail('No rehearsal receipt found. Run --rehearse first.');
  const receipt = JSON.parse(fs.readFileSync(RECEIPT_PATH, 'utf8'));
  if (receipt.baseUrl !== BASE_URL) fail('Receipt BASE_URL mismatch: ' + receipt.baseUrl);
  fs.mkdirSync(ART, { recursive: true });

  // Synthesize voice once before browser recording. PATCH: force=true so edited narration
  // is regenerated and not reused from stale cached AIFF files.
  const voice = synthesizeVoice(narration.scenes, true);
  const voiceMap = {};
  let cumulative = 0;
  const audioStarts = [];
  for (let i = 0; i < voice.length; i++) {
    audioStarts.push(+cumulative.toFixed(3));
    cumulative += voice[i].durationMs / 1000;
  }
  if (cumulative > MAX_TOTAL_SECONDS) fail('Audio total ' + cumulative.toFixed(1) + 's exceeds max ' + MAX_TOTAL_SECONDS);

  console.log('Recording walkthrough against ' + BASE_URL);
  const { browser, context, page } = await launchBrowser(true);
  // Video recording begins at page creation; anchor scene timestamps to that clock.
  const videoStart = Date.now();
  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const timeline = await runFlow(page, { record: true, scenes: narration.scenes, voiceMap: voice, timing: null, videoStart });
    fs.writeFileSync(TIMING_PATH, JSON.stringify(timeline, null, 2));
    // B1 fix: capture the Video handle while the page is still open (page.video() may
    // return null after page close; docs only guarantee path() once context closes).
    // Sequence: obtain handle -> close page/context/browser (flushes file) -> await path().
    const video = page.video();
    if (!video) fail('page.video() returned null before close; recording was not enabled');
    await page.close().catch(() => {});
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    const recordedPath = await video.path();
    if (!recordedPath || !fs.existsSync(recordedPath)) {
      fail('Playwright did not return a video path via page.video().path()');
    }
    fs.copyFileSync(recordedPath, WEBM_PATH);
    fs.rmSync(recordedPath, { force: true });
    console.log('WebM saved: ' + WEBM_PATH);
    await assemble();
  } catch (e) {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
    fail('Record failed: ' + e.message);
  }
}

async function assemble() {
  ensureExecutable(FFMPEG, 'ffmpeg');
  if (!fs.existsSync(WEBM_PATH)) fail('Missing WebM: ' + WEBM_PATH);
  if (!fs.existsSync(TIMING_PATH)) fail('Missing scene timing: ' + TIMING_PATH);
  const timeline = JSON.parse(fs.readFileSync(TIMING_PATH, 'utf8'));
  if (timeline.length !== loadNarration().scenes.length) fail('Timeline must match the narration scene count');

  const videoDur = ffmpegDurationSeconds(WEBM_PATH);
  // Build audio filter: each scene's AIFF delayed to its scene start, then amix.
  const inputs = [];
  const filterParts = [];
  for (let i = 0; i < timeline.length; i++) {
    const aiff = path.join(VOICE_DIR, timeline[i].id + '.aiff');
    if (!fs.existsSync(aiff)) fail('Missing voice for scene ' + timeline[i].id);
    inputs.push('-i', aiff);
    const delayMs = Math.round(timeline[i].start * 1000);
    filterParts.push('[' + (i + 1) + ':a]adelay=' + delayMs + '|' + delayMs + '[a' + i + ']');
  }
  const mixLabels = timeline.map((_, i) => '[a' + i + ']').join('');
  // B3 fix: normalize=0 keeps each narration at full AIFF volume (amix divides
  // amplitude across inputs by default, making narration too quiet to hear).
  // apad=whole_dur pads the audio track with silence to exactly the video length;
  // note it pads zeros (silence), it does not 'prevent silence' — narration ends when
  // the last scene's voice ends, and the remaining tail is intentionally quiet hold.
  const filterComplex = filterParts.join(';') + ';' + mixLabels + 'amix=inputs=' + timeline.length + ':duration=longest:dropout_transition=0:normalize=0,apad=whole_dur=' + videoDur.toFixed(3) + '[aout]';

  const args = [
    '-y', '-hide_banner', '-i', WEBM_PATH,
    ...inputs,
    '-filter_complex', filterComplex,
    '-map', '0:v', '-map', '[aout]',
    // Playwright records VP8/WebM; VP8 cannot be stream-copied into MP4, so transcode to
    // H.420p H.264 (the pinned ffmpeg binary bundles libx264) for a stable, playable MP4.
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-crf', '23',
    '-c:a', 'aac', '-b:a', '128k', '-ar', '44100',
    '-movflags', '+faststart',
    // Explicit output duration from the recorded video keeps the full narration mix;
    // '-shortest' previously truncated the delayed audio streams early.
    '-t', videoDur.toFixed(3),
    MP4_PATH,
  ];
  console.log('Muxing MP4 ...');
  const r = spawnSync(FFMPEG, args, { encoding: 'utf8' });
  if (r.status !== 0 || !fs.existsSync(MP4_PATH)) fail('ffmpeg mux failed: ' + (r.stderr || '').toString().slice(-2000));

  // Verify with ffmpeg metadata.
  const probe = spawnSync(FFMPEG, ['-hide_banner', '-i', MP4_PATH], { encoding: 'utf8' });
  const sdur = (probe.stderr || '').match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (!sdur) fail('Cannot read MP4 duration');
  const seconds = Number(sdur[1]) * 3600 + Number(sdur[2]) * 60 + parseFloat(sdur[3]);
  if (seconds < 125 || seconds > MAX_TOTAL_SECONDS) fail('MP4 duration ' + seconds.toFixed(1) + 's outside 125-165s band');
  if (!/Stream #.*Audio/.test(probe.stderr || '')) fail('MP4 missing audio stream');
  // B3 verify: confirm narration is actually audible (non-trivial peak) and that
  // the mixed audio was not near-silent. volumedetect is a real ffmpeg filter.
  const vol = spawnSync(FFMPEG, ['-hide_banner', '-i', MP4_PATH, '-map', '0:a', '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
  const peak = ((vol.stderr || '').match(/max_volume:\s*(-?[\d.]+) dB/) || [])[1];
  if (peak === undefined) fail('Cannot detect MP4 audio peak (volumedetect)');
  if (parseFloat(peak) < -40) fail('MP4 audio effectively silent: max volume ' + peak + ' dB');
  const vmatch = (probe.stderr || '').match(/(\d{3,4})x(\d{3,4})/);
  if (!vmatch) fail('Cannot read MP4 resolution');
  const width = Number(vmatch[1]);
  const height = Number(vmatch[2]);

  const manifest = {
    file: path.relative(ROOT, MP4_PATH),
    webm: path.relative(ROOT, WEBM_PATH),
    seconds: +seconds.toFixed(3),
    width,
    height,
    synthetic: true,
    published: false,
    scenes: timeline,
    badge: PERSISTENT_BADGE,
    credits: 'Built by Rishik Rontala',
    limitations: 'Physical cutting/real success still unverified. Illustrated input only; not a camera photograph.',
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log('MP4 saved: ' + MP4_PATH + ' (' + seconds.toFixed(1) + 's, ' + width + 'x' + height + ')');
  console.log('Manifest saved: ' + MANIFEST_PATH);
}

async function main() {
  const flags = parseArgs();
  if (flags.rehearse) return rehearse();
  if (flags.record) return record();
  if (flags.assemble) return assemble();
}

main().catch((e) => fail(e.message));
