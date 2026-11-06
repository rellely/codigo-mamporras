import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {rand} from '../../lib/anim';

const sid = () => useId().replace(/:/g, '');

export const Sky: React.FC<{stops: [number, string][]; x?: number; y?: number; w?: number; h?: number}> = ({stops, x = -2000, y = -2000, w = 5080, h = 4400}) => {
	const id = sid();
	return (
		<>
			<defs>
				<linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
					{stops.map(([o, c], i) => (
						<stop key={i} offset={o} stopColor={c} />
					))}
				</linearGradient>
			</defs>
			<rect x={x} y={y} width={w} height={h} fill={`url(#sky${id})`} />
		</>
	);
};

export const Stars: React.FC<{count?: number; top?: number; bottom?: number; seed?: number; opacity?: number; xMin?: number; xMax?: number}> = ({
	count = 120,
	top = -400,
	bottom = 900,
	seed = 1,
	opacity = 1,
	xMin = -300,
	xMax = 1380,
}) => {
	const frame = useCurrentFrame();
	return (
		<g opacity={opacity}>
			{new Array(count).fill(0).map((_, i) => {
				const x = xMin + rand(i, seed) * (xMax - xMin);
				const y = top + rand(i, seed + 1) ** 1.4 * (bottom - top);
				const r = 0.8 + rand(i, seed + 2) * 2.4;
				const tw = 0.55 + 0.45 * Math.sin(frame / (8 + rand(i, 9) * 14) + i);
				return <circle key={i} cx={x} cy={y} r={r} fill="#fffbe8" opacity={tw * (0.4 + rand(i, 5) * 0.6)} />;
			})}
		</g>
	);
};

export const Moon: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 70}) => {
	const id = sid();
	return (
		<g>
			<defs>
				<radialGradient id={`mg${id}`}>
					<stop offset="0%" stopColor="#dfe8ff" stopOpacity={0.45} />
					<stop offset="100%" stopColor="#dfe8ff" stopOpacity={0} />
				</radialGradient>
			</defs>
			<circle cx={x} cy={y} r={r * 4} fill={`url(#mg${id})`} />
			<circle cx={x} cy={y} r={r} fill="#f1f3ff" />
			<circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.18} fill="#d5d9ea" />
			<circle cx={x + r * 0.25} cy={y + r * 0.3} r={r * 0.12} fill="#d5d9ea" />
			<circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.08} fill="#d5d9ea" />
		</g>
	);
};

export const Sun: React.FC<{x: number; y: number; r?: number; color?: string; glow?: string}> = ({x, y, r = 110, color = '#ffe2a8', glow = '#ffb35c'}) => {
	const id = sid();
	return (
		<g>
			<defs>
				<radialGradient id={`sg${id}`}>
					<stop offset="0%" stopColor={glow} stopOpacity={0.85} />
					<stop offset="100%" stopColor={glow} stopOpacity={0} />
				</radialGradient>
			</defs>
			<circle cx={x} cy={y} r={r * 5} fill={`url(#sg${id})`} />
			<circle cx={x} cy={y} r={r} fill={color} />
		</g>
	);
};

/** A mountain ridge drawn from smooth noise. */
export const Ridge: React.FC<{y: number; amp: number; color: string; seed: string; offset?: number; x0?: number; x1?: number; freq?: number; bottom?: number; sharp?: boolean}> = ({
	y,
	amp,
	color,
	seed,
	offset = 0,
	x0 = -1500,
	x1 = 2600,
	freq = 0.0016,
	bottom = 3000,
	sharp = false,
}) => {
	const pts: string[] = [];
	for (let x = x0; x <= x1; x += 30) {
		const n = noise2D(seed, (x + offset) * freq, 0);
		const n2 = noise2D(seed + 'b', (x + offset) * freq * 3, 0);
		const h = sharp ? Math.abs(n) * 1.4 + n2 * 0.25 : n + n2 * 0.25;
		pts.push(`${x},${(y - h * amp).toFixed(1)}`);
	}
	return <polygon points={`${x0},${bottom} ${pts.join(' ')} ${x1},${bottom}`} fill={color} />;
};

/** A stylised pine tree; origin at the base of the trunk. */
export const Pine: React.FC<{x: number; y: number; h: number; color: string; trunk?: string; sway?: number; seed?: number; highlight?: string}> = ({
	x,
	y,
	h,
	color,
	trunk = '#2a1d17',
	sway = 0,
	seed = 0,
	highlight,
}) => {
	const frame = useCurrentFrame();
	const s = sway * Math.sin(frame / 40 + seed);
	const w = h * 0.42;
	const tiers = [0, 1, 2, 3];
	return (
		<g transform={`translate(${x} ${y})`}>
			<rect x={-h * 0.03} y={-h * 0.14} width={h * 0.06} height={h * 0.16} fill={trunk} />
			{tiers.map((t) => {
				const ty = -h * 0.1 - t * h * 0.22;
				const tw = w * (1 - t * 0.2);
				const top = ty - h * 0.36;
				const sx = s * (t + 1) * 0.6;
				return (
					<g key={t}>
						<path d={`M ${-tw / 2} ${ty} Q ${sx} ${ty + h * 0.04} ${tw / 2} ${ty} L ${sx * 1.5} ${top} Z`} fill={color} />
						{highlight && <path d={`M ${sx * 1.5} ${top} L ${tw / 2} ${ty} Q ${tw * 0.2} ${ty + h * 0.02} ${sx * 0.5} ${ty} Z`} fill={highlight} opacity={0.35} />}
					</g>
				);
			})}
		</g>
	);
};

export const Forest: React.FC<{
	count: number;
	y: number;
	hMin: number;
	hMax: number;
	color: string;
	seed: number;
	x0?: number;
	x1?: number;
	offset?: number;
	sway?: number;
	jitterY?: number;
	highlight?: string;
	skip?: [number, number];
}> = ({count, y, hMin, hMax, color, seed, x0 = -600, x1 = 1680, offset = 0, sway = 2, jitterY = 30, highlight, skip}) => (
	<g>
		{new Array(count).fill(0).map((_, i) => {
			const x = x0 + ((i + rand(i, seed) * 0.7) / count) * (x1 - x0) - offset;
			if (skip && x > skip[0] && x < skip[1]) return null;
			const h = hMin + rand(i, seed + 3) * (hMax - hMin);
			return <Pine key={i} x={x} y={y + rand(i, seed + 7) * jitterY} h={h} color={color} sway={sway} seed={i} highlight={highlight} />;
		})}
	</g>
);

/** The big rock wall that backs the campsite (shadow screen). */
export const RockWall: React.FC<{y?: number; base?: number; color?: string; shade?: string; light?: string}> = ({
	y = 620,
	base = 1235,
	color = '#6d6470',
	shade = '#4f4754',
	light = '#8a8190',
}) => {
	const top: string[] = [];
	for (let x = -700; x <= 1800; x += 40) {
		top.push(`${x},${(y - 80 * noise2D('rock', x * 0.004, 0) - 40 * Math.abs(noise2D('rock2', x * 0.013, 0))).toFixed(1)}`);
	}
	return (
		<g>
			<polygon points={`-700,${base} ${top.join(' ')} 1800,${base}`} fill={color} />
			{/* strata / facets */}
			{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
				const x = -600 + i * 210 + rand(i, 4) * 60;
				const w = 120 + rand(i, 5) * 140;
				const yy = y + 60 + rand(i, 6) * 380;
				return <path key={i} d={`M ${x} ${yy} l ${w * 0.5} ${-30 - rand(i, 7) * 40} l ${w * 0.5} ${40 + rand(i, 8) * 30} l ${-w * 0.2} ${90 + rand(i, 9) * 80} z`} fill={i % 2 ? shade : light} opacity={0.35} />;
			})}
			{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
				const x = -500 + i * 300 + rand(i, 11) * 120;
				const yy = y + 80 + rand(i, 12) * 300;
				return <path key={'c' + i} d={`M ${x} ${yy} l 18 60 l -12 50 l 22 70`} stroke={shade} strokeWidth={5} fill="none" opacity={0.7} strokeLinecap="round" />;
			})}
			{/* base shadow + moss */}
			<rect x={-700} y={base - 70} width={2500} height={70} fill={shade} opacity={0.6} />
			{new Array(26).fill(0).map((_, i) => (
				<ellipse key={'m' + i} cx={-680 + i * 100 + rand(i, 13) * 60} cy={base - 8} rx={50 + rand(i, 14) * 50} ry={18 + rand(i, 15) * 12} fill="#3d5a3a" opacity={0.75} />
			))}
		</g>
	);
};

export const Ground: React.FC<{y: number; top: string; bottom: string; x0?: number; x1?: number}> = ({y, top, bottom, x0 = -1500, x1 = 2600}) => {
	const id = sid();
	return (
		<g>
			<defs>
				<linearGradient id={`gr${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={top} />
					<stop offset="100%" stopColor={bottom} />
				</linearGradient>
			</defs>
			<rect x={x0} y={y} width={x1 - x0} height={2400} fill={`url(#gr${id})`} />
		</g>
	);
};

export const GrassTufts: React.FC<{y0: number; y1: number; count: number; color: string; seed?: number; x0?: number; x1?: number}> = ({y0, y1, count, color, seed = 3, x0 = -200, x1 = 1280}) => {
	const frame = useCurrentFrame();
	return (
		<g>
			{new Array(count).fill(0).map((_, i) => {
				const x = x0 + rand(i, seed) * (x1 - x0);
				const y = y0 + rand(i, seed + 1) * (y1 - y0);
				const s = 0.6 + ((y - y0) / Math.max(1, y1 - y0)) * 0.9;
				const sw = Math.sin(frame / 25 + i) * 3;
				return (
					<path
						key={i}
						d={`M ${x - 14 * s} ${y} Q ${x - 10 * s + sw} ${y - 26 * s} ${x - 18 * s + sw} ${y - 40 * s} M ${x} ${y} Q ${x + sw} ${y - 34 * s} ${x + 4 * s + sw * 1.4} ${y - 52 * s} M ${x + 12 * s} ${y} Q ${x + 14 * s + sw} ${y - 22 * s} ${x + 22 * s + sw} ${y - 34 * s}`}
						stroke={color}
						strokeWidth={4 * s}
						fill="none"
						strokeLinecap="round"
					/>
				);
			})}
		</g>
	);
};

export const Rock: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#5b5560'}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<path d="M -60 0 Q -64 -40 -30 -56 Q 10 -70 40 -48 Q 66 -30 60 0 Z" fill={color} />
		<path d="M -30 -56 Q 10 -70 40 -48 Q 10 -46 -10 -30 Z" fill="#fff" opacity={0.12} />
	</g>
);

/** Drifting fog banks made from soft radial ellipses (cheap, no blur filter). */
export const Fog: React.FC<{y: number; color?: string; opacity?: number; speed?: number; count?: number; seed?: number; height?: number}> = ({
	y,
	color = '#c8d0e8',
	opacity = 0.35,
	speed = 0.6,
	count = 7,
	seed = 2,
	height = 180,
}) => {
	const frame = useCurrentFrame();
	const id = sid();
	return (
		<g opacity={opacity}>
			<defs>
				<radialGradient id={`fog${id}`}>
					<stop offset="0%" stopColor={color} stopOpacity={0.9} />
					<stop offset="60%" stopColor={color} stopOpacity={0.35} />
					<stop offset="100%" stopColor={color} stopOpacity={0} />
				</radialGradient>
			</defs>
			{new Array(count).fill(0).map((_, i) => {
				const w = 500 + rand(i, seed) * 500;
				const span = 2200;
				const x = ((rand(i, seed + 1) * span + frame * speed * (0.6 + rand(i, seed + 2))) % span) - 600;
				return <ellipse key={i} cx={x} cy={y + (rand(i, seed + 3) - 0.5) * height} rx={w} ry={height * (0.5 + rand(i, seed + 4) * 0.5)} fill={`url(#fog${id})`} />;
			})}
		</g>
	);
};

export const Bird: React.FC<{x: number; y: number; s?: number; phase?: number; color?: string}> = ({x, y, s = 1, phase = 0, color = '#2a1830'}) => {
	const frame = useCurrentFrame();
	const f = Math.sin(frame * 0.5 + phase) * 14;
	return <path d={`M ${x - 20 * s} ${y - f * s * 0.6} Q ${x - 9 * s} ${y - 6 * s} ${x} ${y} Q ${x + 9 * s} ${y - 6 * s} ${x + 20 * s} ${y - f * s * 0.6}`} stroke={color} strokeWidth={3.5 * s} fill="none" strokeLinecap="round" />;
};
