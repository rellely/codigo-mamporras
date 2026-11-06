// Renderiza fotogramas de revisión: node scripts/stills.mjs <composition> <outdir> <frame> [frame...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const [,, id, out, ...frames] = process.argv;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('assets')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const composition = await selectComposition({serveUrl, id, browserExecutable});
for (const fr of frames) {
  await renderStill({composition, serveUrl, output: `${out}/${id}_${fr}.jpg`, frame: Number(fr), imageFormat: 'jpeg', scale: 0.5, browserExecutable, chromiumOptions: {gl: 'swangle'}});
  console.log('ok', fr);
}
