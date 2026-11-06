// Montaje de un episodio: escenas secuenciadas según la narración, audio (voz + música con ducking + efectos),
// subtítulos, transiciones e identidad de la serie.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FPS, useFonts} from './core';
import {EndCard, Grade, HookTitle, HypoTag, InkWipe, LineT, SeriesBug, Sfx, Subtitles, WhatIfBurst} from './Overlays';

export interface SceneTiming {id: string; s: number; e: number; lines: LineT[]}
export interface Timing {id: string; titulo: string; total: number; scenes: SceneTiming[]}
export interface Cue {line: (i: number) => number; lineEnd: (i: number) => number; word: (w: string, nth?: number) => number}
export type SceneFC = React.FC<{d: number; cue: Cue}>;

const makeCue = (sc: SceneTiming): Cue => {
  const rel = (t: number) => Math.round((t - sc.s) * FPS);
  return {
    line: (i) => rel(sc.lines[Math.min(i, sc.lines.length - 1)].s),
    lineEnd: (i) => rel(sc.lines[Math.min(i, sc.lines.length - 1)].e),
    word: (w, nth = 0) => {
      const all = sc.lines.flatMap((l) => l.words); const key = w.toLowerCase();
      const hits = all.filter((x) => x.w.toLowerCase().replace(/[^\p{L}\p{N}%]/gu, '').startsWith(key));
      const h = hits[Math.min(nth, hits.length - 1)];
      return h ? rel(h.s) : 0;
    },
  };
};

export const episodeFrames = (t: Timing) => Math.round(t.total * FPS) + 6;

export const Episode: React.FC<{timing: Timing; scenes: Record<string, SceneFC>; hook: {text: string; hl?: string}; question: string;
  tint?: string; hypo?: string[]; whatIf?: string[]; musicVol?: number}> = ({timing, scenes, hook, question, tint, hypo = [], whatIf = [], musicVol = 0.3}) => {
  useFonts();
  const f = useCurrentFrame();
  const allLines = useMemo(() => timing.scenes.flatMap((s) => s.lines), [timing]);
  const duck = useMemo(() => {
    const n = episodeFrames(timing); const arr = new Float32Array(n);
    for (let i = 0; i < n; i++) { const t = i / FPS; arr[i] = allLines.some((l) => t >= l.s - 0.15 && t <= l.e + 0.2) ? 0.5 : 1; }
    // suavizado
    const out = new Float32Array(n); let v = arr[0];
    for (let i = 0; i < n; i++) { v += (arr[i] - v) * 0.12; out[i] = v; }
    return out;
  }, [timing]);
  const last = timing.scenes[timing.scenes.length - 1];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {timing.scenes.map((sc, i) => {
        const from = Math.round(sc.s * FPS); const to = i === timing.scenes.length - 1 ? episodeFrames(timing) : Math.round(sc.e * FPS);
        const Comp = scenes[sc.id];
        return <Sequence key={sc.id} from={from} durationInFrames={to - from} name={sc.id}>
          {Comp ? <Comp d={to - from} cue={makeCue(sc)} /> : <AbsoluteFill style={{background: '#300', color: '#fff', fontSize: 60}}>{sc.id}</AbsoluteFill>}
          {hypo.includes(sc.id) && <HypoTag />}
          {whatIf.includes(sc.id) && <><WhatIfBurst at={2} /><Sfx name="glitch" at={2} vol={0.5} /><Sfx name="riser" at={0} vol={0.25} /></>}
        </Sequence>;
      })}
      <Grade tint={tint} />
      <Subtitles lines={allLines} raiseFrom={Math.round((last.lines[last.lines.length - 1].s) * FPS) - 4} />
      <Sequence from={0} durationInFrames={110} layout="none"><HookTitle text={hook.text} hl={hook.hl} dur={105} /></Sequence>
      {f > 100 && <SeriesBug title={timing.titulo.replace(/^¿Y si /i, '').replace(/\?$/, '').toUpperCase()} />}
      <EndCard from={Math.round((last.lines[last.lines.length - 1].s) * FPS)} question={question} />
      {timing.scenes.slice(1).map((sc) => <React.Fragment key={'t' + sc.id}><InkWipe at={Math.round(sc.s * FPS)} /><Sfx name="whoosh" at={Math.round(sc.s * FPS) - 8} vol={0.35} /></React.Fragment>)}
      <Audio src={staticFile(`audio/narration/${timing.id}.wav`)} volume={1} />
      <Audio src={staticFile(`audio/music/${timing.id}.wav`)} volume={(fr) => musicVol * (duck[fr] ?? 1)} />
      <Sfx name="impact" at={0} vol={0.5} />
    </AbsoluteFill>
  );
};
