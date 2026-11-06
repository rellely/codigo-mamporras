// Núcleo compartido: fuentes, utilidades de animación, ruido y paleta de la serie "¿Y SI...?"
import React from 'react';
import {continueRender, delayRender, interpolate, Easing, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

let fontsHandle: number | null = null;
let fontsLoaded = false;
export const useFonts = () => {
  if (typeof window === 'undefined' || fontsLoaded || fontsHandle !== null) return;
  fontsHandle = delayRender('fonts');
  const faces = [
    new FontFace('Anton', `url(${staticFile('fonts/anton-latin-400-normal.woff2')})`),
    new FontFace('Anton', `url(${staticFile('fonts/anton-latin-ext-400-normal.woff2')})`, {unicodeRange: 'U+0100-024F, U+1E00-1EFF'}),
    new FontFace('Montserrat', `url(${staticFile('fonts/montserrat-latin-600-normal.woff2')})`, {weight: '600'}),
    new FontFace('Montserrat', `url(${staticFile('fonts/montserrat-latin-800-normal.woff2')})`, {weight: '800'}),
    new FontFace('Montserrat', `url(${staticFile('fonts/montserrat-latin-900-normal.woff2')})`, {weight: '900'}),
  ];
  Promise.all(faces.map((f) => f.load().then((l) => (document as any).fonts.add(l)))).then(() => {
    fontsLoaded = true; continueRender(fontsHandle!);
  });
};

export const W = 1080, H = 1920, FPS = 30;
export const C = {
  ink: '#1c1724', ink2: '#2c2537', yellow: '#FFD60A', white: '#fffaf0', red: '#d7263d', gold: '#e8b33b',
  shadow: 'rgba(20,10,40,0.28)',
};
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = Easing.bezier(0.45, 0, 0.2, 1);
export const easeOut = Easing.bezier(0.15, 0.8, 0.3, 1);
/** interpolación suave con clamp entre (f0,v0) y (f1,v1) */
export const tween = (f: number, f0: number, f1: number, v0: number, v1: number, e = ease) =>
  interpolate(f, [f0, f1], [v0, v1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
/** interpolación por fotogramas clave [[f, v], ...] */
export const keys = (f: number, k: [number, number][], e = ease) => {
  if (k.length === 1) return k[0][1];
  return interpolate(f, k.map((x) => x[0]), k.map((x) => x[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
};
// ruido determinista 1D (value noise suavizado)
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 57), hash(i + 1 + seed * 57), u) * 2 - 1;
};
export const rand = (i: number, seed = 0) => hash(i * 13.37 + seed * 7.13);
export const useT = () => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return {f, t: f / fps, fps}; };
export const sec = (s: number) => Math.round(s * FPS);
export const FONT_TITLE = 'Anton, Impact, sans-serif';
export const FONT_UI = 'Montserrat, Arial, sans-serif';
