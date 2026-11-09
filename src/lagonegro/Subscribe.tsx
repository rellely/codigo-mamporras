import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {kf} from '../lib/anim';

/** Animated subscribe button: cursor moves in, clicks, button turns "SUSCRITO", bell rings. */
export const SubscribeButton: React.FC<{clickAt: number; appearAt?: number; scale?: number}> = ({clickAt, appearAt = 0, scale = 1}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: frame - appearAt, fps, config: {damping: 12, stiffness: 160}});
	const clicked = frame >= clickAt;
	const press = clicked && frame < clickAt + 5 ? 0.9 : 1;
	const cx = kf(frame, [[clickAt - 24, 520], [clickAt - 2, 250]]);
	const cy = kf(frame, [[clickAt - 24, 180], [clickAt - 2, 62]]);
	const ring = clicked ? Math.sin((frame - clickAt) * 1.2) * 18 * Math.max(0, 1 - (frame - clickAt) / 30) : 0;
	return (
		<div style={{position: 'relative', width: 560, height: 130, transform: `scale(${p * scale})`, opacity: Math.min(1, p * 1.4)}}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 440,
					height: 120,
					borderRadius: 60,
					background: clicked ? '#3a3a3a' : '#ff0033',
					border: '6px solid #000',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 14,
					fontFamily: 'InterBlack',
					fontSize: 50,
					color: '#fff',
					transform: `scale(${press})`,
					boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
				}}
			>
				{clicked && (
					<svg width={44} height={44} viewBox="0 0 24 24">
						<path d="M4 12 l5 5 l11 -11" stroke="#fff" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				)}
				{clicked ? 'SUSCRITO' : 'SUSCRÍBETE'}
			</div>
			<div style={{position: 'absolute', left: 456, top: 10, width: 100, height: 100, borderRadius: 50, background: '#fff', border: '6px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<svg width={58} height={58} viewBox="0 0 24 24" style={{transform: `rotate(${ring}deg)`}}>
					<path d="M12 2 C8 2 6 5 6 9 L6 14 L4 17 L20 17 L18 14 L18 9 C18 5 16 2 12 2 Z" fill={clicked ? '#ffd60a' : '#111'} />
					<circle cx={12} cy={20} r={2.4} fill={clicked ? '#ffd60a' : '#111'} />
				</svg>
			</div>
			{frame < clickAt + 20 && (
				<svg width={70} height={90} viewBox="0 0 24 30" style={{position: 'absolute', left: cx, top: cy, opacity: kf(frame, [[clickAt - 26, 0], [clickAt - 20, 1], [clickAt + 12, 1], [clickAt + 20, 0]])}}>
					<path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 17 L20 17 Z" fill="#fff" stroke="#000" strokeWidth={1.6} strokeLinejoin="round" />
				</svg>
			)}
		</div>
	);
};

/** Intro call to action: stay until the end + subscribe. */
export const StayCTA: React.FC<{clickAt: number}> = ({clickAt}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const a = spring({frame: frame - 4, fps, config: {damping: 12, stiffness: 140}});
	return (
		<div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
			<div
				style={{
					fontFamily: 'InterBlack',
					fontSize: 78,
					lineHeight: 1.05,
					textAlign: 'center',
					color: '#fff',
					WebkitTextStroke: '10px #000',
					paintOrder: 'stroke fill',
					transform: `scale(${0.6 + 0.4 * a})`,
					opacity: a,
				}}
			>
				QUÉDATE HASTA
				<br />
				<span style={{color: '#FFD60A'}}>EL FINAL</span>
			</div>
			<div style={{fontFamily: 'InterBlack', fontSize: 44, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '12px 28px', borderRadius: 24, opacity: a}}>TÚ ELIGES EN LOS COMENTARIOS</div>
			<SubscribeButton clickAt={clickAt} appearAt={clickAt - 40} />
		</div>
	);
};
