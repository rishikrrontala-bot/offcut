import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/e2e',timeout:240000,use:{baseURL:process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:3037',headless:true,channel:'chrome',viewport:{width:1440,height:1000},launchOptions:{args:['--mute-audio']}},reporter:[['list']],outputDir:'artifacts/browser-tests'});
