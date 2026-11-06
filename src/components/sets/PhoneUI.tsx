import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CAST, CharId} from '../Character';
import {pop} from '../../lib/anim';
import {useTr} from '../../lib/timeline';

export const SCREEN = {w: 600, h: 1180};

/**
 * Portrait phone held in a hand. Children are drawn in screen space
 * (0..600 x 0..1180). Origin of the group = phone centre.
 */
export const Phone: React.FC<{x: number; y: number; s?: number; rot?: number; hand?: CharId; children: React.ReactNode; glow?: number}> = ({
	x,
	y,
	s = 1,
	rot = 0,
	hand = 'sara',
	children,
	glow = 1,
}) => {
	const frame = useCurrentFrame();
	const L = CAST[hand];
	const sway = Math.sin(frame / 28) * 1.2;
	return (
		<g transform={`translate(${x} ${y}) rotate(${rot + sway}) scale(${s})`}>
			<defs>
				<radialGradient id="phoneglow">
					<stop offset="0%" stopColor="#9fd0ff" stopOpacity={0.35} />
					<stop offset="100%" stopColor="#9fd0ff" stopOpacity={0} />
				</radialGradient>
				<clipPath id="screenclip">
					<rect x={-SCREEN.w / 2} y={-SCREEN.h / 2} width={SCREEN.w} height={SCREEN.h} rx={46} />
				</clipPath>
			</defs>
			<circle r={900} fill="url(#phoneglow)" opacity={glow} />
			{/* arm + palm behind */}
			<path d="M 120 520 Q 220 900 300 1500 L 700 1500 Q 560 900 380 480 Z" fill={L.jacket} />
			<ellipse cx={250} cy={560} rx={190} ry={150} fill={L.skin} />
			<rect x={-SCREEN.w / 2 - 22} y={-SCREEN.h / 2 - 22} width={SCREEN.w + 44} height={SCREEN.h + 44} rx={64} fill="#0c0c10" />
			<g clipPath="url(#screenclip)">
				<g transform={`translate(${-SCREEN.w / 2} ${-SCREEN.h / 2})`}>{children}</g>
			</g>
			<rect x={-60} y={-SCREEN.h / 2 + 14} width={120} height={30} rx={15} fill="#000" />
			{/* fingers + thumb in front */}
			{[0, 1, 2].map((i) => (
				<ellipse key={i} cx={-SCREEN.w / 2 - 18} cy={180 + i * 95} rx={38} ry={44} fill={L.skin} />
			))}
			<ellipse cx={SCREEN.w / 2 + 10} cy={320} rx={44} ry={80} fill={L.skin} transform={`rotate(-20 ${SCREEN.w / 2 + 10} 320)`} />
		</g>
	);
};

export const StatusBar: React.FC<{time?: string; dark?: boolean}> = ({time = '03:12', dark = true}) => (
	<g>
		<rect width={SCREEN.w} height={70} fill={dark ? '#000' : '#f2f2f6'} opacity={dark ? 0.6 : 1} />
		<text x={50} y={50} fontFamily="InterBlack" fontSize={28} fill={dark ? '#fff' : '#111'}>
			{time}
		</text>
		<rect x={500} y={30} width={44} height={20} rx={5} fill="none" stroke={dark ? '#fff' : '#111'} strokeWidth={3} />
		<rect x={504} y={34} width={22} height={12} rx={2} fill={dark ? '#fff' : '#111'} />
	</g>
);

/** A photo viewer: `photo` is drawn into a 600x800 area. */
export const GalleryScreen: React.FC<{photo: React.ReactNode; date: string; index: string; time?: string}> = ({photo, date, index, time}) => (
	<g>
		<rect width={SCREEN.w} height={SCREEN.h} fill="#000" />
		<g transform="translate(0 190)">{photo}</g>
		<StatusBar time={time} />
		<text x={SCREEN.w / 2} y={125} textAnchor="middle" fontFamily="InterBlack" fontSize={30} fill="#fff">
			{date}
		</text>
		<text x={SCREEN.w / 2} y={160} textAnchor="middle" fontFamily="InterBlack" fontSize={22} fill="#9aa">
			{index}
		</text>
		<g transform="translate(0 1030)">
			{[0, 1, 2, 3, 4].map((i) => (
				<rect key={i} x={40 + i * 108} y={20} width={92} height={92} rx={10} fill={['#7a4a6a', '#6a5a8a', '#2a2a40', '#1a1a28', '#101018'][i]} stroke={i === 4 ? '#fff' : 'none'} strokeWidth={4} />
			))}
		</g>
	</g>
);

export type ChatMsg = {from: CharId | 'me' | 'system'; text: string; at: number};

const wrap = (t: string, n = 22) => {
	const words = t.split(' ');
	const lines: string[] = [];
	let cur = '';
	words.forEach((w) => {
		if ((cur + ' ' + w).trim().length > n) {
			lines.push(cur.trim());
			cur = w;
		} else cur += ' ' + w;
	});
	if (cur.trim()) lines.push(cur.trim());
	return lines;
};

/** Group chat with messages popping in at their frames. */
export const ChatScreen: React.FC<{msgs: ChatMsg[]; typing?: {from: CharId; at: number; until: number}; title?: string; members?: string}> = ({
	msgs,
	typing,
	title = 'ACAMPADA',
	members = 'Leo, Marta, Dani, Sara, Iker, ?',
}) => {
	const frame = useCurrentFrame();
	const t = useTr();
	const visible = msgs.filter((m) => frame >= m.at);
	let y = 1010;
	const placed: {m: ChatMsg; y: number; h: number; lines: string[]}[] = [];
	const showTyping = typing && frame >= typing.at && frame < typing.until;
	if (showTyping) y -= 90;
	[...visible].reverse().forEach((m) => {
		const lines = wrap(m.text);
		const h = m.from === 'system' ? 54 : 40 + lines.length * 40 + (m.from !== 'me' ? 30 : 0);
		y -= h + 18;
		placed.push({m, y, h, lines});
	});
	return (
		<g>
			<rect width={SCREEN.w} height={SCREEN.h} fill="#0f1a17" />
			{new Array(40).fill(0).map((_, i) => (
				<circle key={i} cx={(i * 137) % 600} cy={(i * 211) % 1180} r={10} fill="#16241f" />
			))}
			<StatusBar time="09:41" />
			<rect y={70} width={SCREEN.w} height={110} fill="#1d2b27" />
			<circle cx={70} cy={125} r={34} fill="#e8722e" />
			<path d="M 52 140 L 70 104 L 88 140 Z" fill="#fff" />
			<text x={124} y={118} fontFamily="InterBlack" fontSize={30} fill="#fff">
				{title}
			</text>
			<text x={124} y={154} fontFamily="InterBlack" fontSize={21} fill="#9fb">
				{members}
			</text>
			{placed.map(({m, y: yy, h, lines}, i) => {
				const p = pop(frame, m.at, 30, 12);
				if (m.from === 'system') {
					return (
						<g key={i} transform={`translate(300 ${yy + h / 2}) scale(${p})`}>
							<rect x={-250} y={-h / 2} width={500} height={h} rx={16} fill="#2d3a36" />
							<text y={9} textAnchor="middle" fontFamily="InterBlack" fontSize={24} fill="#d8e6e0">
								{m.text}
							</text>
						</g>
					);
				}
				const mine = m.from === 'me';
				const isSixth = m.from === 'sixth';
				const w = Math.min(470, Math.max(...lines.map((l) => l.length)) * 19 + 60);
				const x0 = mine ? 560 - w : 40;
				const name = mine ? '' : isSixth ? '?' : CAST[m.from as CharId].name;
				const nameCol = isSixth ? '#c8ccd6' : CAST[(m.from as CharId) ?? 'leo']?.jacket;
				return (
					<g key={i} transform={`translate(${x0 + (mine ? w : 0)} ${yy + h}) scale(${p}) translate(${-(x0 + (mine ? w : 0))} ${-(yy + h)})`}>
						<rect x={x0} y={yy} width={w} height={h} rx={22} fill={mine ? '#1f6f55' : isSixth ? '#2a2c33' : '#23302c'} stroke={isSixth ? '#8a90a0' : 'none'} strokeWidth={3} />
						{!mine && (
							<text x={x0 + 24} y={yy + 38} fontFamily="InterBlack" fontSize={24} fill={nameCol}>
								{name}
							</text>
						)}
						{lines.map((l, k) => (
							<text key={k} x={x0 + 24} y={yy + (mine ? 52 : 80) + k * 40} fontFamily="InterBlack" fontSize={30} fill="#f1f5f3">
								{l}
							</text>
						))}
					</g>
				);
			})}
			{showTyping && (
				<g>
					<rect x={40} y={940} width={240} height={70} rx={22} fill="#2a2c33" stroke="#8a90a0" strokeWidth={3} />
					{[0, 1, 2].map((i) => (
						<circle key={i} cx={90 + i * 40} cy={975 - Math.max(0, Math.sin(frame / 3 - i)) * 10} r={10} fill="#c8ccd6" />
					))}
					<text x={300} y={985} fontFamily="InterBlack" fontSize={22} fill="#9aa">
						{t('? está escribiendo...', '? is typing...')}
					</text>
				</g>
			)}
			<rect y={1060} width={SCREEN.w} height={120} fill="#1d2b27" />
			<rect x={30} y={1085} width={460} height={64} rx={32} fill="#2a3a35" />
			<circle cx={540} cy={1117} r={34} fill="#1f9e75" />
		</g>
	);
};
