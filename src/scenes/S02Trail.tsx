import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CAST, Character, CharId, walkPose} from '../components/Character';
import {Dust, Tint} from '../components/env/Camp';
import {Bird, Forest, Ground, GrassTufts, Pine, Ridge, Sky, Sun} from '../components/env/Nature';
import {Stage} from '../components/Stage';
import {kf, pop} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {useScene} from '../lib/timeline';

const WALKERS: {id: CharId; x: number}[] = [
	{id: 'leo', x: 880},
	{id: 'marta', x: 712},
	{id: 'dani', x: 544},
	{id: 'sara', x: 376},
	{id: 'iker', x: 200},
];
const GY = 1560;
const SC = 0.86;

const NameTag: React.FC<{x: number; y: number; name: string; p: number; color: string}> = ({x, y, name, p, color}) => {
	if (p <= 0.001) return null;
	const w = name.length * 30 + 50;
	return (
		<g transform={`translate(${x} ${y}) scale(${p})`}>
			<rect x={-w / 2} y={-38} width={w} height={64} rx={32} fill="#fff" stroke="#000" strokeWidth={5} />
			<circle cx={-w / 2 + 26} cy={-6} r={11} fill={color} />
			<text x={12} y={8} textAnchor="middle" fontFamily="InterBlack" fontWeight={900} fontSize={38} fill="#111">
				{name.toUpperCase()}
			</text>
			<path d="M -12 26 L 0 44 L 12 26 Z" fill="#fff" stroke="#000" strokeWidth={5} strokeLinejoin="round" />
			<rect x={-14} y={20} width={28} height={8} fill="#fff" />
		</g>
	);
};

/** Sunset hike: five friends introduced by name. */
export const S02Trail: React.FC = () => {
	const frame = useCurrentFrame();
	const {scene, f, dur, lineStart} = useScene();
	const scroll = frame * 5.5;
	const l1 = lineStart(1);
	const cam = useCam(
		[
			{f: 0, x: 560, y: 1330, z: 1.32},
			{f: l1 - 10, x: 540, y: 1300, z: 1.18},
			{f: l1 + 40, x: 540, y: 1110, z: 0.98},
			{f: dur, x: 560, y: 1080, z: 0.94},
		],
		2.5,
	);
	const names = scene.lines[0].words;
	const tagFor = (id: CharId) => {
		const norm = (s: string) => s.replace(/[^\wñ]/gi, '').toLowerCase();
		const order = WALKERS.map((wk) => names.find((x) => norm(x.w) === CAST[wk.id].name.toLowerCase())).filter(Boolean) as typeof names;
		const i = order.findIndex((x) => norm(x.w) === CAST[id].name.toLowerCase());
		if (i < 0) return 0;
		const next = order[i + 1];
		const p = pop(frame, f(order[i].start) - 2);
		const outAt = next ? f(next.start) + 2 : l1 + 6;
		return p * kf(frame, [[outAt, 1], [outAt + 6, 0]]);
	};
	return (
		<Stage cam={cam}>
			<Sky x={-1000} y={-600} w={3100} h={2000} stops={[[0, '#26164a'], [0.32, '#6b3378'], [0.55, '#e0607a'], [0.75, '#ffae6b'], [1, '#ffd59e']]} />
			<Sun x={760} y={kf(frame, [[0, 1030], [dur, 1075]])} r={120} />
			{[0, 1, 2].map((i) => (
				<Bird key={i} x={((frame * (3 + i) + i * 300) % 1600) - 300} y={520 + i * 70 + Math.sin(frame / 20 + i) * 20} s={1 - i * 0.2} phase={i} />
			))}
			<Ridge y={1150} amp={190} color="#9a4f7e" seed="far" offset={scroll * 0.15} freq={0.0012} sharp />
			{/* the old rock in the distance */}
			<path d="M 760 1130 L 800 860 Q 860 800 930 840 L 990 900 L 1040 1130 Z" fill="#6a3a66" />
			<Ridge y={1230} amp={140} color="#6b3a66" seed="mid" offset={scroll * 0.35} freq={0.0018} />
			<Forest count={46} y={1300} hMin={150} hMax={260} color="#3e2350" seed={5} offset={scroll * 0.6} x0={-800} x1={2600} sway={1} />
			<Forest count={30} y={1420} hMin={220} hMax={360} color="#2a1734" seed={9} offset={scroll * 0.85} x0={-800} x1={2800} sway={1.5} />
			<Ground y={1460} top="#5a3247" bottom="#2a1626" />
			<path d={`M -800 1600 Q 300 1540 2000 1585 L 2000 1640 Q 300 1600 -800 1660 Z`} fill="#7a4659" opacity={0.6} />
			<GrassTufts y0={1470} y1={1900} count={60} color="#3a1f30" seed={4} x0={-300 - (scroll % 400)} x1={1800 - (scroll % 400)} />
			{WALKERS.map(({id, x}, i) => (
				<Character key={id} id={id} x={x} y={GY + (i % 2) * 6} scale={SC} pose={{...walkPose(frame, 0.3, i * 1.1), turn: 0.65, lookX: 0.6, backpack: true, mouth: i === 0 ? 'grin' : 'smile'}} />
			))}
			{WALKERS.map(({id, x}) => (
				<NameTag key={id} x={x} y={GY - 360 * SC} name={CAST[id].name} p={tagFor(id)} color={CAST[id].jacket} />
			))}
			<Pine x={-150 - frame * 1.2} y={2150} h={1250} color="#12070f" />
			<Pine x={1260 - frame * 1.2} y={2200} h={1150} color="#12070f" />
			<Tint color="#ff9a6b" opacity={0.18} />
			<Dust count={50} color="#ffe2b0" opacity={0.5} drift={0.8} />
		</Stage>
	);
};
