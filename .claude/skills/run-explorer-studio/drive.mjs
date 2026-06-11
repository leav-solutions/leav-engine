// Drives a headless Chromium against the locally-running LEAV stack to
// observe app-studio / explorer-studio rendering and produce screenshots.
//
// The stack is managed by the developer (not started here). This script only
// authenticates a browser session and navigates.
//
// Usage (run from the repo root so `playwright` resolves):
//   node .claude/skills/run-app-studio/drive.mjs \
//     --url "http://core.leav.localhost/app/explorer-studio/campaigns_workspace/campaigns_list" \
//     [--click "Catalogue"] \
//     [--clip "1095,60,505,760"] \
//     [--out /tmp/leav-shot.png] \
//     [--wait 6000]
//
// Auth: logs in with admin/admin via the LEAV `login` app when redirected,
// then reuses the session stored in /tmp/leav-state.json on subsequent runs.

import {chromium} from 'playwright';
import {existsSync} from 'node:fs';

const DEV_LOGIN = 'admin';
const DEV_PASSWORD = 'admin';
const STATE_PATH = '/tmp/leav-state.json';
const LOGIN_PATH = '/app/login';

function getArg(name, fallback) {
    const idx = process.argv.indexOf(`--${name}`);
    return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

const targetUrl = getArg('url');
const clickAria = getArg('click');
const clipRaw = getArg('clip'); // "x,y,w,h"
const outPath = getArg('out', 'tmp/leav-shot.png');
const hydrateWaitMs = Number(getArg('wait', '6000'));

if (!targetUrl) {
    console.error('Missing --url');
    process.exit(1);
}

const browser = await chromium.launch({args: ['--no-sandbox'], channel: 'chrome'});
try {
    const context = await browser.newContext({
        viewport: {width: 1_600, height: 1_000},
        locale: 'fr-FR',
        ...(existsSync(STATE_PATH) ? {storageState: STATE_PATH} : {}),
    });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(targetUrl, {waitUntil: 'networkidle', timeout: 60_000});

    // If the saved session is missing/expired we land on the login app: fill it.
    if (page.url().includes(LOGIN_PATH)) {
        await page.waitForSelector('input', {timeout: 30_000});
        const inputs = page.locator('input');
        await inputs.nth(0).fill(DEV_LOGIN);
        await inputs.nth(1).fill(DEV_PASSWORD);
        await page.getByRole('button', {name: /se connecter/i}).click();
        await page.waitForFunction(loginPath => !location.href.includes(loginPath), LOGIN_PATH, {timeout: 60_000});
        if (!page.url().startsWith(targetUrl)) {
            await page.goto(targetUrl, {waitUntil: 'networkidle', timeout: 60_000});
        }
    }

    // Extra wait for animations or delayed renders after networkidle.
    if (hydrateWaitMs > 0) {
        await page.waitForTimeout(hydrateWaitMs);
    }

    if (clickAria) {
        await page.getByRole('button', {name: clickAria, exact: true}).first().click();
        await page.waitForTimeout(2_500);
    }

    const screenshotOptions = {path: outPath};
    if (clipRaw) {
        const [x, y, width, height] = clipRaw.split(',').map(Number);
        screenshotOptions.clip = {x, y, width, height};
    }
    await page.screenshot(screenshotOptions);

    await context.storageState({path: STATE_PATH});

    console.log('FINAL_URL:', page.url());
    console.log('TITLE:', await page.title());
    console.log('OUT:', outPath);
    console.log('CONSOLE_ERRORS:', consoleErrors.length);
    consoleErrors.slice(0, 8).forEach(e => console.log('  -', e.slice(0, 160)));
} finally {
    await browser.close();
}
