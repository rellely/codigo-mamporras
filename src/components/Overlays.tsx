import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {rand} from '../lib/anim';

/** Animated film grain from a tiled noise texture. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.09}) => {
	const frame = useCurrentFrame();
	const ox = Math.floor(rand(frame, 1) * 512);
	const oy = Math.floor(rand(frame, 2) * 512);
	return (
		<AbsoluteFill
			style={{
				backgroundImage: `url(${staticFile('textures/grain.png')})`,
				backgroundPosition: `${ox}px ${oy}px`,
				backgroundSize: '512px 512px',
				opacity,
				mixBlendMode: 'overlay',
				pointerEvents: 'none',
			}}
		/>
	);
};

/** Fades a scene in/out to black. */
export const Fade: React.FC<{dur: number; inF?: number; outF?: number; color?: string}> = ({dur, inF = 0, outF = 0, color = '#000'}) => {
	const frame = useCurrentFrame();
	let o = 0;
	if (inF > 0) o = Math.max(o, interpolate(frame, [0, inF], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	if (outF > 0) o = Math.max(o, interpolate(frame, [dur - outF, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	if (o <= 0) return null;
	return <AbsoluteFill style={{background: color, opacity: o}} />;
};

/** White flash (camera flash / impact). */
export const Flash: React.FC<{at: number; len?: number; color?: string; peak?: number}> = ({at, len = 14, color = '#fff', peak = 1}) => {
	const frame = useCurrentFrame();
	const o = interpolate(frame, [at - 1, at, at + len], [0, peak, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	if (o <= 0) return null;
	return <AbsoluteFill style={{background: color, opacity: o}} />;
};

/** Letterbox-free cinematic bars of colour aberration used for glitches. */
export const Glitch: React.FC<{at: number; len?: number; children: React.ReactNode}> = ({at, len = 12, children}) => {
	const frame = useCurrentFrame();
	const on = frame >= at && frame < at + len;
	if (!on) return <>{children}</>;
	const k = frame - at;
	const dx = (rand(k, 3) - 0.5) * 40;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `translateX(${dx}px)`, filter: 'hue-rotate(90deg) saturate(2)', opacity: 0.6, mixBlendMode: 'screen'}}>{children}</AbsoluteFill>
			<AbsoluteFill style={{transform: `translateX(${-dx}px)`}}>{children}</AbsoluteFill>
			{new Array(5).fill(0).map((_, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: rand(k * 7 + i, 1) * 1920,
						height: 20 + rand(k + i, 2) * 80,
						background: i % 2 ? 'rgba(255,0,60,0.25)' : 'rgba(0,255,230,0.2)',
						transform: `translateX(${(rand(i + k, 4) - 0.5) * 120}px)`,
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

export {Img};
