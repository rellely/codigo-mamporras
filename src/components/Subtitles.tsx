import React, {useMemo} from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Timeline, Word} from '../lib/timeline';

type Page = {words: Word[]; start: number; end: number; speaker: string};

const MAX_WORDS = 3;
const MAX_CHARS = 17;

/** Groups narration into short, punchy caption pages (TikTok style). */
export const buildPages = (tl: Timeline): Page[] => {
	const pages: Page[] = [];
	const allLines = tl.scenes.flatMap((s) => s.lines.map((l) => ({...l, base: s.start})));
	allLines.forEach((line, li) => {
		let cur: Word[] = [];
		const flush = () => {
			if (cur.length) pages.push({words: cur, start: 0, end: 0, speaker: line.speaker});
			cur = [];
		};
		line.words.forEach((w) => {
			const abs = {...w, start: w.start + line.base, end: w.end + line.base};
			const chars = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
			if (cur.length >= MAX_WORDS || (cur.length > 0 && chars > MAX_CHARS)) flush();
			cur.push(abs);
			if (/[.,…?!]$/.test(w.w)) flush();
		});
		flush();
		const lineEndAbs = line.end + line.base;
		const next = allLines[li + 1];
		const nextStart = next ? next.start + next.base : Infinity;
		// set page start/end for pages of this line
		const mine = pages.filter((p) => p.end === 0 && p.start === 0);
		mine.forEach((p, i) => {
			p.start = p.words[0].start - 0.05;
			const nxt = mine[i + 1];
			p.end = nxt ? nxt.words[0].start - 0.05 : Math.min(lineEndAbs + 0.45, nextStart - 0.08);
		});
	});
	return pages;
};

export const Subtitles: React.FC<{tl: Timeline; top?: number}> = ({tl, top = 1230}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const pages = useMemo(() => buildPages(tl), [tl]);
	const page = pages.find((p) => t >= p.start && t < p.end);
	if (!page) return null;
	const sixth = page.speaker === 'sixth';
	const pageIn = spring({frame: frame - page.start * fps, fps, config: {damping: 14, stiffness: 220, mass: 0.5}});
	return (
		<div
			style={{
				position: 'absolute',
				left: 60,
				right: 60,
				top,
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				alignItems: 'center',
				gap: '0 36px',
				transform: `translateY(${(1 - pageIn) * 24}px)`,
				filter: sixth ? 'drop-shadow(0 0 18px rgba(150,200,255,0.55))' : undefined,
			}}
		>
			{page.words.map((w, i) => {
				const local = frame - w.start * fps;
				const s = spring({frame: local, fps, config: {damping: 12, stiffness: 260, mass: 0.45}});
				const active = t >= w.start && t < w.end + 0.08;
				const visible = local >= -1;
				const color = w.hl ? '#FFD60A' : sixth ? '#d6e6ff' : '#FFFFFF';
				const jitter = sixth ? Math.sin(frame * 1.7 + i) * 1.5 : 0;
				return (
					<span
						key={i}
						style={{
							fontFamily: 'InterBlack',
							fontWeight: 900,
							fontSize: w.hl ? 104 : 92,
							lineHeight: 1.12,
							color,
							opacity: visible ? Math.min(1, s * 1.4) : 0,
							transform: `translate(${jitter}px, ${(1 - s) * 18}px) scale(${(0.7 + 0.3 * s) * (active ? 1.08 : 1)})`,
							display: 'inline-block',
							WebkitTextStroke: '14px #000',
							paintOrder: 'stroke fill',
							textShadow: '0 8px 0 rgba(0,0,0,0.85), 0 0 30px rgba(0,0,0,0.6)',
							letterSpacing: -1,
							textTransform: 'uppercase',
						}}
					>
						{w.w}
					</span>
				);
			})}
		</div>
	);
};
