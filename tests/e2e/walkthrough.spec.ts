import { test, expect } from '@playwright/test';

test.describe('Walkthrough page and published video asset', () => {
  test('root exposes the walkthrough link and the walkthrough page serves a real, honest, muted video', async ({ page, request }) => {
    // Fresh browser context: no localStorage project, so the studio shows the empty state
    // with the discoverable walkthrough link.
    await page.goto('/');
    const walkthroughLink = page.getByRole('link', { name: 'Watch the illustrated walkthrough' });
    await expect(walkthroughLink).toBeVisible();
    await walkthroughLink.click();
    await expect(page).toHaveURL(/\/walkthrough/);

    // Heading and honest framing.
    await expect(page.getByRole('heading', { level: 1, name: 'OFFCUT engineering walkthrough' })).toBeVisible();
    const honesty = page.getByText('Illustrated input, real segmentation. Camera-photo accuracy and physical assembly remain unverified.');
    await expect(honesty).toBeVisible();
    await expect(
      page.getByText('the public YouTube demo and physical proof are still pending. This page does not claim any rules are fulfilled.')
    ).toBeVisible();

    // Back link to the studio and the credit.
    await expect(page.getByRole('link', { name: '← Back to the studio' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('link', { name: 'Built by Rishik Rontala' })).toBeVisible();

    // The real published asset must exist BEFORE release: no mocks, real HTTP check.
    const videoResponse = await request.get('/demo/engineering-walkthrough.mp4');
    expect(videoResponse.status()).toBe(200);
    expect((videoResponse.headers()['content-type'] || '').toLowerCase()).toContain('video/mp4');
    expect((await videoResponse.body()).length).toBeGreaterThan(0);

    const transcriptResponse = await request.get('/demo/walkthrough-transcript.txt');
    expect(transcriptResponse.status()).toBe(200);
    const transcript = await transcriptResponse.text();
    expect(transcript.trim().length).toBeGreaterThan(0);
    // Honesty wording must survive into the published transcript.
    expect(transcript.toLowerCase()).toContain('illustrated');
    expect(transcript.toLowerCase()).toContain('unverified');
    // The transcript is generated from the actual narration JSON: the exact opening
    // narration line (which is also a burned-in caption) must be present verbatim.
    expect(transcript).toContain(
      'OFFCUT turns leftover paper into a collage you can actually make. This is an engineering demonstration using the built-in illustrated example.'
    );

    // Real video metadata loads naturally (metadata load is not speaker playback; the
    // browser is headless and globally muted via --mute-audio, so no speaker playthrough).
    const video = page.locator('video');
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute('muted', '');

    await page.waitForFunction(() => {
      const v = document.querySelector('video');
      return !!v && v.readyState >= 1 && v.videoWidth > 0 && v.videoHeight > 0;
    }, undefined, { timeout: 30000 });

    const meta = await page.evaluate(() => {
      const v = document.querySelector('video')!;
      return {
        videoWidth: v.videoWidth,
        videoHeight: v.videoHeight,
        duration: v.duration,
        autoplay: v.autoplay,
        paused: v.paused,
        muted: v.muted,
      };
    });

    expect(meta.videoWidth).toBe(1280);
    expect(meta.videoHeight).toBe(720);
    expect(meta.duration).toBeGreaterThanOrEqual(125);
    expect(meta.duration).toBeLessThanOrEqual(180);
    expect(meta.autoplay).toBe(false);
    expect(meta.paused).toBe(true);
    expect(meta.muted).toBe(true);
  });

  test('walkthrough page has no horizontal overflow at a 390 px phone width', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto('/walkthrough');
    await expect(page.getByRole('heading', { level: 1, name: 'OFFCUT engineering walkthrough' })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await context.close();
  });
});
