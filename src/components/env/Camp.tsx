import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {rand} from '../../lib/anim';

const sid = () => useId().replace(/:/g, '');

/** Flicker value around 1 for fire light. */
export const useFlicker = (amount = 0.12, seed = 'fl') => {
	const frame = useCurrentFrame();
	return 1 + noise2D(seed, frame * 0.15, 0) * amount + noise2D(seed + '2', frame * 0.5, 0) * amount * 0.4;
};

export const Log: React.FC<{x: number; y: number; w: number; rot?: number; color?: string}> = ({x, y, w, rot = 0, color = '#6b4428'}) => (
	<g transform={`translate(${x} ${y}) rotate(${rot})`}>
		<rect x={-w / 2} y={-22} width={w} height={44} rx={22} fill={color} />
		<rect x={-w / 2 + 20} y={-14} width={w - 60} height={6} rx={3} fill="#000" opacity={0.18} />
		<rect x={-w / 2 + 40} y={4} width={w - 110} height={5} rx={3} fill="#000" opacity={0.15} />
		<ellipse cx={w / 2 - 6} cy={0} rx={14} ry={21} fill="#c99a62" />
		<ellipse cx={w / 2 - 6} cy={0} rx={7} ry={11} fill="none" stroke="#8a6238" strokeWidth={2.5} />
	</g>
);

/** Animated campfire; intensity 0..1 scales flames (0 = embers). */
export const Campfire: React.FC<{x: number; y: number; s?: number; intensity?: number; wind?: number}> = ({x, y, s = 1, intensity = 1, wind = 0}) => {
	const frame = useCurrentFrame();
	const id = sid();
	const flame = (i: number, color: string, hBase: number, wBase: number) => {
		const n = noise2D('flame' + i, frame * 0.18, i);
		const h = hBase * (0.85 + n * 0.25) * intensity;
		const w = wBase * (0.9 + noise2D('fw' + i, frame * 0.2, 0) * 0.15) * Math.max(0.3, intensity);
		const tip = noise2D('tip' + i, frame * 0.25, 0) * 18 + wind * h * 0.9;
		return <path key={color + i} d={`M ${-w} 0 Q ${-w * 1.1} ${-h * 0.45} ${tip * 0.4} ${-h * 0.7} Q ${tip} ${-h * 0.85} ${tip * 1.2} ${-h} Q ${w * 0.6 + tip * 0.5} ${-h * 0.55} ${w} 0 Z`} fill={color} />;
	};
	const sparks = new Array(18).fill(0).map((_, i) => {
		const life = 40 + rand(i, 3) * 30;
		const t = ((frame + rand(i, 1) * 200) % life) / life;
		const sx = (rand(i, 2) - 0.5) * 60 + noise2D('sp' + i, frame * 0.05, 0) * 40 * t + wind * 260 * t;
		const sy = -60 - t * (220 + rand(i, 4) * 200);
		return <circle key={i} cx={sx} cy={sy} r={2.5 + rand(i, 5) * 2.5} fill="#ffd27a" opacity={(1 - t) * intensity} />;
	});
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<defs>
				<radialGradient id={`ember${id}`}>
					<stop offset="0%" stopColor="#ff9a3c" stopOpacity={0.9} />
					<stop offset="100%" stopColor="#ff3d00" stopOpacity={0} />
				</radialGradient>
			</defs>
			{/* stones */}
			{new Array(9).fill(0).map((_, i) => {
				const a = (i / 9) * Math.PI * 2;
				return <ellipse key={i} cx={Math.cos(a) * 92} cy={Math.sin(a) * 26 + 6} rx={26} ry={16} fill={i % 2 ? '#5a5560' : '#6c6670'} />;
			})}
			<ellipse cx={0} cy={0} rx={70} ry={18} fill="#1a1010" />
			<ellipse cx={0} cy={-4} rx={60} ry={16} fill={`url(#ember${id})`} opacity={0.6 + 0.4 * Math.max(0.25, intensity)} />
			{/* logs */}
			<rect x={-70} y={-24} width={140} height={22} rx={11} fill="#4a2e1c" transform="rotate(-14)" />
			<rect x={-70} y={-24} width={140} height={22} rx={11} fill="#5a3822" transform="rotate(16)" />
			{intensity > 0.02 && (
				<g style={{mixBlendMode: 'screen'}}>
					{flame(0, '#d8361e', 230, 62)}
					{flame(1, '#ff7a1a', 190, 50)}
					{flame(2, '#ffb52e', 140, 36)}
					{flame(3, '#fff1b0', 80, 20)}
				</g>
			)}
			{sparks}
		</g>
	);
};

/** Smoke wisps rising from a point. */
export const Smoke: React.FC<{x: number; y: number; amount?: number; color?: string; wind?: number}> = ({x, y, amount = 1, color = '#b8b8c8', wind = 0}) => {
	const frame = useCurrentFrame();
	const id = sid();
	return (
		<g opacity={amount}>
			<defs>
				<radialGradient id={`sm${id}`}>
					<stop offset="0%" stopColor={color} stopOpacity={0.5} />
					<stop offset="100%" stopColor={color} stopOpacity={0} />
				</radialGradient>
			</defs>
			{new Array(10).fill(0).map((_, i) => {
				const life = 90;
				const t = ((frame + i * 9) % life) / life;
				const px = x + noise2D('sm' + i, frame * 0.02, 0) * 50 * t + wind * 300 * t;
				const py = y - t * 420;
				return <circle key={i} cx={px} cy={py} r={30 + t * 90} fill={`url(#sm${id})`} opacity={Math.sin(Math.PI * t)} />;
			})}
		</g>
	);
};

/** A-frame tent; origin at the bottom centre. pop = 0..1 for pitch animation. */
export const Tent: React.FC<{x: number; y: number; w?: number; h?: number; color: string; dark: string; pop?: number; glow?: number}> = ({
	x,
	y,
	w = 260,
	h = 190,
	color,
	dark,
	pop = 1,
	glow = 0,
}) => {
	if (pop <= 0.001) return null;
	const sy = pop;
	const sx = 0.7 + 0.3 * pop;
	return (
		<g transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
			<line x1={-w / 2 - 40} y1={0} x2={0} y2={-h} stroke="#d8d0c0" strokeWidth={2} opacity={0.5} />
			<line x1={w / 2 + 40} y1={0} x2={0} y2={-h} stroke="#d8d0c0" strokeWidth={2} opacity={0.5} />
			<path d={`M ${-w / 2} 0 L 0 ${-h} L ${w / 2} 0 Z`} fill={color} />
			<path d={`M 0 ${-h} L ${w / 2} 0 L ${w * 0.18} 0 Z`} fill={dark} opacity={0.6} />
			<path d={`M ${-w * 0.16} 0 L 0 ${-h * 0.62} L ${w * 0.16} 0 Z`} fill={glow > 0 ? '#ffcf7a' : '#1d1720'} opacity={glow > 0 ? 0.4 + glow * 0.6 : 0.85} />
			<line x1={0} y1={-h} x2={0} y2={-h * 0.62} stroke={dark} strokeWidth={4} />
			<circle cx={0} cy={-h - 6} r={6} fill="#aaa" />
		</g>
	);
};

/**
 * Night lighting: darkens everything except around light sources.
 * Lights are rendered as holes in a darkness mask + an additive glow.
 */
export type Light = {x: number; y: number; r: number; color?: string; glow?: number; rx?: number};
export const Darkness: React.FC<{color?: string; opacity: number; lights: Light[]; area?: [number, number, number, number]}> = ({
	color = '#070814',
	opacity,
	lights,
	area = [-2000, -2000, 5080, 6000],
}) => {
	const id = sid();
	return (
		<g>
			<defs>
				<radialGradient id={`hole${id}`}>
					<stop offset="0%" stopColor="#000" stopOpacity={1} />
					<stop offset="30%" stopColor="#000" stopOpacity={0.85} />
					<stop offset="65%" stopColor="#000" stopOpacity={0.3} />
					<stop offset="100%" stopColor="#000" stopOpacity={0} />
				</radialGradient>
				<mask id={`dm${id}`} maskUnits="userSpaceOnUse" x={area[0]} y={area[1]} width={area[2]} height={area[3]}>
					<rect x={area[0]} y={area[1]} width={area[2]} height={area[3]} fill="#fff" />
					{lights.map((l, i) => (
						<ellipse key={i} cx={l.x} cy={l.y} rx={l.rx ?? l.r} ry={l.r} fill={`url(#hole${id})`} />
					))}
				</mask>
				{lights.map((l, i) => (
					<radialGradient key={i} id={`lg${id}${i}`}>
						<stop offset="0%" stopColor={l.color ?? '#ff9a3c'} stopOpacity={0.38 * (l.glow ?? 1)} />
						<stop offset="55%" stopColor={l.color ?? '#ff7a1a'} stopOpacity={0.1 * (l.glow ?? 1)} />
						<stop offset="100%" stopColor={l.color ?? '#ff7a1a'} stopOpacity={0} />
					</radialGradient>
				))}
			</defs>
			<rect x={area[0]} y={area[1]} width={area[2]} height={area[3]} fill={color} opacity={opacity} mask={`url(#dm${id})`} />
			<g style={{mixBlendMode: 'screen'}}>
				{lights.map((l, i) => (
					<ellipse key={i} cx={l.x} cy={l.y} rx={(l.rx ?? l.r) * 0.9} ry={l.r * 0.9} fill={`url(#lg${id}${i})`} />
				))}
			</g>
		</g>
	);
};

/** Colour grade overlay (multiply tint). */
export const Tint: React.FC<{color: string; opacity: number}> = ({color, opacity}) => (
	<rect x={-2000} y={-2000} width={5080} height={6000} fill={color} opacity={opacity} style={{mixBlendMode: 'multiply'}} />
);

export const Fireflies: React.FC<{count?: number; area: [number, number, number, number]; opacity?: number; seed?: number; color?: string}> = ({
	count = 24,
	area,
	opacity = 1,
	seed = 4,
	color = '#e9ff8a',
}) => {
	const frame = useCurrentFrame();
	const id = sid();
	return (
		<g opacity={opacity} style={{mixBlendMode: 'screen'}}>
			<defs>
				<radialGradient id={`ff${id}`}>
					<stop offset="0%" stopColor={color} stopOpacity={1} />
					<stop offset="25%" stopColor={color} stopOpacity={0.6} />
					<stop offset="100%" stopColor={color} stopOpacity={0} />
				</radialGradient>
			</defs>
			{new Array(count).fill(0).map((_, i) => {
				const x = area[0] + rand(i, seed) * area[2] + noise2D('ffx' + i, frame * 0.01, 0) * 80;
				const y = area[1] + rand(i, seed + 1) * area[3] + noise2D('ffy' + i, frame * 0.01, 0) * 60;
				const b = Math.max(0, Math.sin(frame / (10 + rand(i, 3) * 10) + i * 3));
				return <circle key={i} cx={x} cy={y} r={16} fill={`url(#ff${id})`} opacity={b} />;
			})}
		</g>
	);
};

/** Floating dust / ash particles. */
export const Dust: React.FC<{count?: number; color?: string; opacity?: number; seed?: number; drift?: number; size?: number}> = ({
	count = 40,
	color = '#ffe9c2',
	opacity = 0.6,
	seed = 8,
	drift = 0.4,
	size = 3,
}) => {
	const frame = useCurrentFrame();
	return (
		<g opacity={opacity}>
			{new Array(count).fill(0).map((_, i) => {
				const x = ((rand(i, seed) * 1300 + frame * drift * (0.5 + rand(i, seed + 1))) % 1300) - 110 + noise2D('dx' + i, frame * 0.02, 0) * 30;
				const y = rand(i, seed + 2) * 1920 + noise2D('dy' + i, frame * 0.015, 0) * 60 - frame * 0.3 * rand(i, 6);
				return <circle key={i} cx={x} cy={((y % 1920) + 1920) % 1920} r={size * (0.4 + rand(i, seed + 3))} fill={color} opacity={0.3 + 0.7 * rand(i, seed + 4)} />;
			})}
		</g>
	);
};

/** Flashlight cone from (x,y) towards angle (deg, 0 = right). */
export const Beam: React.FC<{x: number; y: number; angle: number; length?: number; spread?: number; intensity?: number}> = ({
	x,
	y,
	angle,
	length = 900,
	spread = 18,
	intensity = 1,
}) => {
	const id = sid();
	const a = (angle * Math.PI) / 180;
	const s = (spread * Math.PI) / 180;
	const p1 = [x + Math.cos(a - s) * length, y + Math.sin(a - s) * length];
	const p2 = [x + Math.cos(a + s) * length, y + Math.sin(a + s) * length];
	return (
		<g style={{mixBlendMode: 'screen'}} opacity={intensity}>
			<defs>
				<linearGradient id={`bm${id}`} gradientUnits="userSpaceOnUse" x1={x} y1={y} x2={x + Math.cos(a) * length} y2={y + Math.sin(a) * length}>
					<stop offset="0%" stopColor="#fffbe0" stopOpacity={0.85} />
					<stop offset="100%" stopColor="#fffbe0" stopOpacity={0.05} />
				</linearGradient>
				<radialGradient id={`bs${id}`}>
					<stop offset="0%" stopColor="#fffbe0" stopOpacity={0.7} />
					<stop offset="100%" stopColor="#fffbe0" stopOpacity={0} />
				</radialGradient>
			</defs>
			<polygon points={`${x},${y} ${p1.join(',')} ${p2.join(',')}`} fill={`url(#bm${id})`} />
			<circle cx={x} cy={y} r={40} fill={`url(#bs${id})`} />
		</g>
	);
};

export const Vignette: React.FC<{strength?: number; color?: string}> = ({strength = 0.7, color = '#000'}) => {
	const id = sid();
	return (
		<svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
			<defs>
				<radialGradient id={`vg${id}`} cx="50%" cy="50%" r="75%">
					<stop offset="45%" stopColor={color} stopOpacity={0} />
					<stop offset="100%" stopColor={color} stopOpacity={strength} />
				</radialGradient>
			</defs>
			<rect width={1080} height={1920} fill={`url(#vg${id})`} />
		</svg>
	);
};
