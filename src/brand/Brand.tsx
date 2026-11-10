import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
import {Character, SharedDefs} from '../components/Character';
import {Darkness} from '../components/env/Camp';
import {Fog, Forest, Moon, Sky, Stars} from '../components/env/Nature';

/** Channel identity — change these two lines to rebrand. */
export const CHANNEL = {name: 'HISTORIAS DE HORROR', tagline: 'TÚ DECIDES CÓMO TERMINAN'};

const useFont = () => {
	const [h] = useState(() => delayRender('font'));
	useEffect(() => {
		const f = new FontFace('InterBlack', `url(${staticFile('fonts/Inter-Black.otf')}) format('opentype')`, {weight: '900'});
		f.load()
			.then((ff) => {
				document.fonts.add(ff);
				continueRender(h);
			})
			.catch(() => continueRender(h));
	}, [h]);
};

const RED = '#e01e2b';

/** Profile picture (800x800, shown as a circle): El Guarda's mask emerging from the dark. */
export const Avatar: React.FC = () => {
	useFont();
	return (
		<AbsoluteFill style={{background: '#050307'}}>
			<svg viewBox="0 0 800 800" width="100%" height="100%">
				<SharedDefs />
				<defs>
					<radialGradient id="av-bg" cx="50%" cy="42%" r="60%">
						<stop offset="0%" stopColor="#5a0a12" />
						<stop offset="55%" stopColor="#1c0408" />
						<stop offset="100%" stopColor="#050307" />
					</radialGradient>
					<radialGradient id="av-rim" cx="50%" cy="50%" r="50%">
						<stop offset="80%" stopColor="#000" stopOpacity={0} />
						<stop offset="100%" stopColor="#000" stopOpacity={0.85} />
					</radialGradient>
				</defs>
				<rect width={800} height={800} fill="url(#av-bg)" />
				{/* the masked figure, framed head-and-shoulders */}
				<g transform="translate(400 1110) scale(2.7)">
					<Character id="masked" x={0} y={0} scale={1} pose={{glowEyes: 1, headTilt: -8, blink: 0}} />
				</g>
				{/* scratch marks */}
				{[0, 1, 2].map((i) => (
					<path key={i} d={`M ${560 + i * 34} ${120 + i * 10} q 30 120 -10 270`} stroke={RED} strokeWidth={14 - i * 3} fill="none" strokeLinecap="round" opacity={0.9} />
				))}
				<rect width={800} height={800} fill="url(#av-rim)" />
			</svg>
		</AbsoluteFill>
	);
};

/** Channel banner (2560x1440). Key content stays inside the 1546x423 safe area. */
export const Banner: React.FC = () => {
	useFont();
	const SAFE = {x: (2560 - 1546) / 2, y: (1440 - 423) / 2, w: 1546, h: 423};
	return (
		<AbsoluteFill style={{background: '#04050b'}}>
			<svg viewBox="0 0 2560 1440" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
				<SharedDefs />
				<Sky stops={[[0, '#030409'], [0.55, '#0b0d26'], [1, '#1a0a14']]} x={0} y={0} w={2560} h={1440} />
				<Stars count={260} top={0} bottom={900} xMin={0} xMax={2560} seed={4} />
				<Moon x={1280} y={330} r={95} />


				<g transform="translate(0 0)">
					<Forest count={70} y={920} hMin={220} hMax={420} color="#03050c" seed={8} x0={-200} x1={2760} sway={0} />
				</g>
				<rect x={0} y={905} width={2560} height={540} fill="#05070f" />
				{new Array(40).fill(0).map((_, i) => (
					<rect key={'r' + i} x={1280 - 80 + ((i * 53) % 160) - (i % 4) * 20} y={915 + i * 12} width={40 + (i % 5) * 30} height={3} fill="#c8d0ff" opacity={0.28 - i * 0.006} />
				))}
				<Fog y={930} color="#8a94c0" opacity={0.25} speed={0} count={12} height={120} />
				{/* left: El Guarda */}
				<g transform="translate(270 1330)">
					<Character id="masked" x={0} y={0} scale={2.25} pose={{item: 'hook', armR: [12, -10], glowEyes: 1, headTilt: -6}} />
				</g>
				{/* right: El Sexto, hooded with glowing eyes */}
				<g transform="translate(2300 1330)">
					<Character id="sixth" x={0} y={0} scale={2.25} pose={{silhouette: '#07070d', glowEyes: 1, headTilt: 8}} />
				</g>
				<Darkness
					opacity={0.55}
					color="#020208"
					area={[0, 0, 2560, 1440]}
					lights={[
						{x: 1280, y: 700, r: 700, rx: 1100, color: RED, glow: 0.25},
						{x: 270, y: 880, r: 420, color: '#ffb070', glow: 0.4},
						{x: 2300, y: 860, r: 380, color: '#8ab4ff', glow: 0.45},
					]}
				/>
				{/* safe-area guide is not drawn; content below sits inside it */}
				<rect x={SAFE.x} y={SAFE.y} width={SAFE.w} height={SAFE.h} fill="none" stroke="none" />
			</svg>
			<div style={{position: 'absolute', left: SAFE.x, top: SAFE.y, width: SAFE.w, height: SAFE.h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
				<div
					style={{
						fontFamily: 'InterBlack',
						fontSize: 118,
						lineHeight: 1,
						color: '#fff',
						letterSpacing: 4,
						WebkitTextStroke: '12px #000',
						paintOrder: 'stroke fill',
						textShadow: `0 0 60px ${RED}, 0 10px 0 #000`,
						whiteSpace: 'nowrap',
					}}
				>
					{CHANNEL.name.split(' ').map((w, i, a) => (
						<span key={i} style={{color: i === a.length - 1 ? RED : '#fff'}}>
							{w}
							{i < a.length - 1 ? ' ' : ''}
						</span>
					))}
				</div>
				<div style={{width: 760, height: 9, background: RED, borderRadius: 5}} />
				<div style={{fontFamily: 'InterBlack', fontSize: 52, color: '#FFD60A', letterSpacing: 6, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>{CHANNEL.tagline}</div>
				<div style={{fontFamily: 'InterBlack', fontSize: 30, color: '#d8d8e0', letterSpacing: 5, whiteSpace: 'nowrap', opacity: 0.9}}>ANIMACIÓN · SERIES DE TERROR · CADA CAPÍTULO LO ELIGES TÚ</div>
			</div>
		</AbsoluteFill>
	);
};
