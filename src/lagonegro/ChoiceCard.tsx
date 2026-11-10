import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {kf} from '../lib/anim';
import {SubscribeButton} from './Subscribe';

export type Option = {key: 'A' | 'B'; text: string; at: number; icon: 'road' | 'cabin' | 'jump' | 'question' | 'boat' | 'window'};

const Icon: React.FC<{kind: Option['icon']}> = ({kind}) => (
	<svg viewBox="0 0 200 200" width={170} height={170}>
		<rect width={200} height={200} rx={30} fill="#0d1220" />
		{kind === 'road' && (
			<g>
				{[20, 60, 140, 175].map((x, i) => (
					<path key={i} d={`M ${x} 150 L ${x - 22} 150 L ${x - 11} 70 Z`} fill="#1f3a2a" />
				))}
				<path d="M 70 200 L 96 90 L 104 90 L 130 200 Z" fill="#3a3a40" />
				<path d="M 100 190 L 100 170 M 100 150 L 100 135 M 100 118 L 100 106" stroke="#ffd60a" strokeWidth={4} />
				<rect x={140} y={70} width={8} height={70} fill="#888" />
				<rect x={124} y={56} width={40} height={24} rx={4} fill="#2a7a3a" />
			</g>
		)}
		{kind === 'jump' && (
			<g>
				<rect x={20} y={110} width={110} height={40} rx={6} fill="#2f4a3a" />
				<rect x={110} y={84} width={50} height={66} rx={6} fill="#355442" />
				<circle cx={50} cy={156} r={14} fill="#111" />
				<circle cx={140} cy={156} r={14} fill="#111" />
				<circle cx={60} cy={58} r={13} fill="#ffd7b5" />
				<path d="M 60 72 L 40 100 M 52 82 L 28 74 M 56 84 L 82 66 M 40 100 L 22 116 M 40 100 L 56 120" stroke="#2f6fd1" strokeWidth={9} strokeLinecap="round" />
				<path d="M 150 40 q 20 -10 30 10" stroke="#ffd60a" strokeWidth={5} fill="none" />
			</g>
		)}
		{kind === 'question' && (
			<g>
				<circle cx={80} cy={88} r={34} fill="#e8b98c" />
				<path d="M 50 80 q -4 -26 12 -28 M 110 80 q 4 -26 -12 -28" stroke="#d8d4cc" strokeWidth={8} fill="none" />
				<path d="M 64 104 q 16 -8 32 0" stroke="#d8d4cc" strokeWidth={7} fill="none" />
				<rect x={46} y={124} width={68} height={60} rx={18} fill="#4a5a3a" />
				<text x={152} y={110} textAnchor="middle" fontFamily="InterBlack" fontSize={90} fill="#ffd60a">?</text>
			</g>
		)}
		{kind === 'boat' && (
			<g>
				<rect y={110} width={200} height={90} fill="#14244a" />
				<circle cx={150} cy={50} r={20} fill="#e8ecff" />
				<path d="M 30 112 Q 100 132 170 112 Q 150 140 100 142 Q 50 140 30 112 Z" fill="#3a5a6a" />
				<line x1={60} y1={100} x2={150} y2={150} stroke="#c8a46a" strokeWidth={6} />
				<path d="M 20 160 q 20 -8 40 0 t 40 0 t 40 0 t 40 0" stroke="#5a7aaa" strokeWidth={4} fill="none" />
			</g>
		)}
		{kind === 'window' && (
			<g>
				<rect x={40} y={40} width={120} height={120} fill="#0d1636" stroke="#7a5a3a" strokeWidth={10} />
				<line x1={100} x2={100} y1={40} y2={160} stroke="#7a5a3a" strokeWidth={8} />
				<circle cx={130} cy={70} r={12} fill="#e8ecff" />
				<path d="M 60 150 l 40 -50 l 18 20" stroke="#ffd7b5" strokeWidth={10} fill="none" strokeLinecap="round" />
			</g>
		)}
		{kind === 'cabin' && (
			<g>
				<rect x={45} y={95} width={110} height={75} fill="#6b4a30" />
				<path d="M 35 98 L 100 45 L 165 98 Z" fill="#3a2a22" />
				<rect x={58} y={112} width={30} height={26} fill="#ffcf7a" />
				<rect x={108} y={112} width={34} height={58} fill="#3a2414" />
				<line x1={100} y1={128} x2={150} y2={150} stroke="#a07a4a" strokeWidth={8} />
				<line x1={100} y1={150} x2={150} y2={128} stroke="#a07a4a" strokeWidth={8} />
			</g>
		)}
	</svg>
);

/** "What should they do?" end card with two options for the audience. */
export const ChoiceCard: React.FC<{title: string; chapter: string; question: string; options: Option[]; ctaAt: number; ctaText: string; subscribeAt?: number}> = ({
	subscribeAt,
	title,
	chapter,
	question,
	options,
	ctaAt,
	ctaText,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const q = spring({frame: frame - 6, fps, config: {damping: 12, stiffness: 140}});
	const cta = spring({frame: frame - ctaAt, fps, config: {damping: 10, stiffness: 160}});
	const pulse = frame > ctaAt ? 1 + 0.03 * Math.sin(frame / 4) : 1;
	return (
		<AbsoluteFill style={{alignItems: 'center'}}>
			<div style={{position: 'absolute', top: 230, fontFamily: 'InterBlack', fontSize: 40, letterSpacing: 6, color: '#ff3b30', opacity: kf(frame, [[0, 0], [12, 1]])}}>
				{title} · {chapter}
			</div>
			<div
				style={{
					position: 'absolute',
					top: 300,
					fontFamily: 'InterBlack',
					fontSize: 112,
					color: '#fff',
					transform: `scale(${0.6 + 0.4 * q})`,
					opacity: q,
					WebkitTextStroke: '12px #000',
					paintOrder: 'stroke fill',
					textShadow: '0 0 40px rgba(255,59,48,0.6)',
				}}
			>
				{question}
			</div>
			{options.map((o, i) => {
				const p = spring({frame: frame - o.at, fps, config: {damping: 12, stiffness: 150}});
				return (
					<div
						key={o.key}
						style={{
							position: 'absolute',
							top: 560 + i * 330,
							left: 70,
							right: 70,
							height: 290,
							borderRadius: 40,
							background: i === 0 ? 'linear-gradient(135deg, #1b3a6b, #0e1d36)' : 'linear-gradient(135deg, #6b1b2a, #36101a)',
							border: `6px solid ${i === 0 ? '#5aa0ff' : '#ff5a6e'}`,
							boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
							display: 'flex',
							alignItems: 'center',
							gap: 28,
							padding: '0 34px',
							transform: `translateX(${(1 - p) * (i === 0 ? -900 : 900)}px) scale(${pulse})`,
							opacity: Math.min(1, p * 1.5),
						}}
					>
						<div style={{width: 130, height: 130, borderRadius: 65, background: i === 0 ? '#5aa0ff' : '#ff5a6e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'InterBlack', fontSize: 90, color: '#fff', flexShrink: 0, WebkitTextStroke: '4px #000', paintOrder: 'stroke fill'}}>
							{o.key}
						</div>
						<div style={{flex: 1, fontFamily: 'InterBlack', fontSize: 52, lineHeight: 1.1, color: '#fff', textTransform: 'uppercase'}}>{o.text}</div>
						<Icon kind={o.icon} />
					</div>
				);
			})}
			<div
				style={{
					position: 'absolute',
					top: 1440,
					padding: '22px 46px',
					borderRadius: 50,
					background: '#ffd60a',
					fontFamily: 'InterBlack',
					fontSize: 56,
					color: '#111',
					transform: `scale(${cta})`,
					opacity: cta,
					border: '6px solid #000',
				}}
			>
				{ctaText}
			</div>
			{subscribeAt !== undefined && (
				<div style={{position: 'absolute', top: 1580, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<SubscribeButton clickAt={subscribeAt} appearAt={subscribeAt - 40} scale={0.9} />
				</div>
			)}
		</AbsoluteFill>
	);
};
