import React, {createContext, useContext} from 'react';
import timelineEs from '../generated/timeline_es.json';
import timelineEn from '../generated/timeline_en.json';

export type Word = {w: string; hl: boolean; start: number; end: number};
export type Line = {speaker: string; text: string; start: number; end: number; words: Word[]};
export type SceneData = {
	id: string;
	start: number;
	duration: number;
	lines: Line[];
	cues: Record<string, number>;
};
export type Timeline = {
	lang: 'es' | 'en';
	fps: number;
	title: string;
	part?: string;
	durationInFrames: number;
	scenes: SceneData[];
};

export type Lang = 'es' | 'en';
export const TIMELINES: Record<Lang, Timeline> = {
	es: timelineEs as unknown as Timeline,
	en: timelineEn as unknown as Timeline,
};

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const sceneFrames = (s: SceneData) => ({
	from: Math.round(s.start * FPS),
	duration: Math.round(s.duration * FPS),
});

const SceneCtx = createContext<{scene: SceneData; lang: Lang} | null>(null);
export const SceneProvider = SceneCtx.Provider;

/** Helpers to address scene-relative times in frames. */
export const useScene = () => {
	const ctx = useContext(SceneCtx);
	if (!ctx) throw new Error('useScene outside SceneProvider');
	const {scene, lang} = ctx;
	const f = (sec: number) => sec * FPS;
	return {
		scene,
		lang,
		dur: Math.round(scene.duration * FPS),
		f,
		cue: (id: string, fallback = 0) => f(scene.cues[id] ?? fallback),
		lineStart: (i: number) => f(scene.lines[i]?.start ?? 0),
		lineEnd: (i: number) => f(scene.lines[i]?.end ?? 0),
		wordStart: (li: number, wi: number) => f(scene.lines[li]?.words[wi]?.start ?? 0),
	};
};

export const useLangText = () => useContext(SceneCtx)?.lang ?? 'es';
/** Pick the string for the current scene language. */
export const useTr = () => {
	const lang = useLangText();
	return (es: string, en: string) => (lang === 'en' ? en : es);
};
export {React};
