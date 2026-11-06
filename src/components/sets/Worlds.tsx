import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CAST, Character, CharId, Pose, walkPose} from '../Character';
import {Badge} from '../CampNight';
import {Beam, Darkness, Fireflies, Light, Tent, Tint} from '../env/Camp';
import {Fog, Forest, Ground, GrassTufts, Pine, Ridge, RockWall, Sky, Stars, Sun} from '../env/Nature';
import {rand} from '../../lib/anim';

const WALK: {id: CharId; x: number}[] = [
	{id: 'leo', x: 880},
	{id: 'marta', x: 712},
	{id: 'dani', x: 544},
	{id: 'sara', x: 376},
	{id: 'iker', x: 200},
];

/** Frozen sunset-trail world (as photographed). Optional stranger among the trees. */
export const TrailWorld: React.FC<{sixth?: {x: number; y: number; s: number; opacity?: number}}> = ({sixth}) => (
	<g>
		<Sky x={-1000} y={-600} w={3100} h={2000} stops={[[0, '#26164a'], [0.32, '#6b3378'], [0.55, '#e0607a'], [0.75, '#ffae6b'], [1, '#ffd59e']]} />
		<Sun x={760} y={1040} r={120} />
		<Ridge y={1150} amp={190} color="#9a4f7e" seed="far" freq={0.0012} sharp />
		<path d="M 760 1130 L 800 860 Q 860 800 930 840 L 990 900 L 1040 1130 Z" fill="#6a3a66" />
		<Ridge y={1230} amp={140} color="#6b3a66" seed="mid" freq={0.0018} />
		<Forest count={46} y={1300} hMin={150} hMax={260} color="#3e2350" seed={5} x0={-800} x1={2600} sway={0} />
		<Forest count={30} y={1420} hMin={220} hMax={360} color="#2a1734" seed={9} x0={-800} x1={2800} sway={0} />
		{sixth && (
			<g opacity={sixth.opacity ?? 1}>
				<Character id="sixth" x={sixth.x} y={sixth.y} scale={sixth.s} pose={{mouth: 'creepy', lookX: -0.4, blink: 0}} />
				<Pine x={sixth.x + 60} y={sixth.y + 10} h={420} color="#24122c" />
			</g>
		)}
		<Ground y={1460} top="#5a3247" bottom="#2a1626" />
		{WALK.map(({id, x}, i) => (
			<Character key={id} id={id} x={x} y={1560 + (i % 2) * 6} scale={0.86} pose={{...walkPose(i * 7, 0.3, i * 1.1), turn: 0.65, lookX: 0.6, backpack: true, mouth: 'smile', blink: 0}} />
		))}
		<Tint color="#ff9a6b" opacity={0.18} />
	</g>
);

export const TENT_POS: {owner: CharId; x: number; y: number}[] = [
	{owner: 'leo', x: 120, y: 1250},
	{owner: 'marta', x: 320, y: 1215},
	{owner: 'dani', x: 540, y: 1200},
	{owner: 'sara', x: 760, y: 1215},
	{owner: 'iker', x: 960, y: 1250},
];

/** Frozen dusk tents world. */
export const TentsWorld: React.FC<{sixth?: {x: number; y: number; s: number}; badges?: boolean}> = ({sixth, badges}) => (
	<g>
		<Sky stops={[[0, '#141433'], [0.48, '#2a2558'], [0.56, '#7b4d8c'], [0.62, '#d0839a'], [1, '#d0839a']]} />
		<Forest count={22} y={640} hMin={260} hMax={420} color="#2a2448" seed={11} sway={0} />
		<RockWall y={560} base={1185} color="#8a7590" shade="#62506d" light="#a493aa" />
		<Ground y={1185} top="#5d4a55" bottom="#3a2c36" />
		{TENT_POS.map((t, i) => (
			<Tent key={i} x={t.x} y={t.y} w={230} h={175} color={CAST[t.owner].jacket} dark={CAST[t.owner].jacketDark} />
		))}
		{badges && TENT_POS.map((t, i) => <Badge key={i} x={t.x} y={t.y - 240} n={i + 1} p={1} />)}
		{sixth && <Character id="sixth" x={sixth.x} y={sixth.y} scale={sixth.s} pose={{mouth: 'creepy', lookX: 0, blink: 0}} />}
		<Character id="leo" x={250} y={1500} scale={0.82} pose={{armR: [160, -20], mouth: 'grin', blink: 0}} />
		<Character id="iker" x={600} y={1520} scale={0.86} pose={{armL: [-40, 30], armR: [40, -30], mouth: 'grin', blink: 0}} />
		<Character id="marta" x={430} y={1460} scale={0.74} pose={{mouth: 'grin', armL: [-150, 0], blink: 0}} />
		<Character id="dani" x={800} y={1470} scale={0.74} pose={{mouth: 'smile', blink: 0}} />
		<Tint color="#8a6bc9" opacity={0.25} />
	</g>
);

/** Leo's garage (interior, evening). Window on the right shows the dark street. */
export const GARAGE_WINDOW = {x: 760, y: 560, w: 300, h: 260};
export const Garage: React.FC<{bulbSwing?: number; windowFigure?: number; darkness?: number; over?: React.ReactNode; under?: React.ReactNode}> = ({
	bulbSwing = 1,
	windowFigure = 0,
	darkness = 0.45,
	over,
	under,
}) => {
	const frame = useCurrentFrame();
	const ang = Math.sin(frame / 22) * 8 * bulbSwing;
	const bulb = {x: 540 + Math.sin((ang * Math.PI) / 180) * 380, y: 260 + Math.cos((ang * Math.PI) / 180) * 380};
	const W = GARAGE_WINDOW;
	return (
		<g>
			<rect x={-800} y={-800} width={2700} height={2300} fill="#5a5f66" />
			{new Array(16).fill(0).map((_, r) =>
				new Array(14).fill(0).map((__, c) => (
					<rect key={r + '-' + c} x={-800 + c * 200 + (r % 2) * 100} y={-800 + r * 90} width={194} height={84} fill="#62676f" opacity={0.5 + rand(r * 20 + c, 1) * 0.3} />
				)),
			)}
			<rect x={-800} y={1380} width={2700} height={1200} fill="#4b4d52" />
			<rect x={-800} y={1380} width={2700} height={14} fill="#3a3c40" />
			{/* window with the street outside */}
			<rect x={W.x} y={W.y} width={W.w} height={W.h} fill="#0f1730" />
			<rect x={W.x} y={W.y + W.h * 0.7} width={W.w} height={W.h * 0.3} fill="#0a0f20" />
			<circle cx={W.x + 230} cy={W.y + 60} r={22} fill="#ffe7a8" opacity={0.6} />
			{windowFigure > 0 && (
				<g opacity={windowFigure}>
					<svg x={W.x} y={W.y} width={W.w} height={W.h} viewBox={`0 0 ${W.w} ${W.h}`}>
						<Character id="sixth" x={W.w * 0.45} y={W.h + 120} scale={0.9} pose={{silhouette: '#05060c', glowEyes: 1, headTilt: -8}} />
					</svg>
				</g>
			)}
			<rect x={W.x} y={W.y} width={W.w} height={W.h} fill="#c8d4e8" opacity={0.12} />
			<rect x={W.x} y={W.y} width={W.w} height={W.h} fill="none" stroke="#2e3036" strokeWidth={16} />
			<line x1={W.x + W.w / 2} x2={W.x + W.w / 2} y1={W.y} y2={W.y + W.h} stroke="#2e3036" strokeWidth={10} />
			{/* shelves + tools */}
			<rect x={30} y={520} width={420} height={18} fill="#6b4a36" />
			<rect x={30} y={720} width={420} height={18} fill="#6b4a36" />
			{[0, 1, 2, 3].map((i) => (
				<rect key={i} x={50 + i * 100} y={440 + (i % 2) * 20} width={70} height={80 - (i % 2) * 20} rx={6} fill={['#c94a3a', '#3a7ac9', '#d8b23a', '#4a9a5a'][i]} />
			))}
			{[0, 1, 2].map((i) => (
				<rect key={'p' + i} x={70 + i * 130} y={630} width={90} height={90} rx={4} fill="#a08060" />
			))}
			<path d="M 120 900 l 0 160 M 100 900 l 40 0" stroke="#888" strokeWidth={12} />
			<circle cx={300} cy={980} r={60} fill="none" stroke="#333" strokeWidth={12} />
			{/* bike against the wall */}
			<g transform="translate(-60 1240)">
				<circle cx={0} cy={60} r={80} fill="none" stroke="#222" strokeWidth={10} />
				<circle cx={240} cy={60} r={80} fill="none" stroke="#222" strokeWidth={10} />
				<path d="M 0 60 L 90 -40 L 200 -40 L 240 60 M 90 -40 L 120 60 L 0 60 M 200 -40 L 210 -90" stroke="#c94a3a" strokeWidth={10} fill="none" />
			</g>
			{under}
			{/* workbench */}
			<rect x={240} y={1290} width={600} height={30} rx={6} fill="#7a5638" />
			<rect x={270} y={1320} width={26} height={200} fill="#5e412a" />
			<rect x={784} y={1320} width={26} height={200} fill="#5e412a" />
			{over}
			{/* bulb */}
			<line x1={540} y1={-200} x2={bulb.x} y2={bulb.y} stroke="#222" strokeWidth={4} />
			<circle cx={bulb.x} cy={bulb.y + 20} r={26} fill="#fff3c8" />
			<Darkness opacity={darkness} color="#0a0c18" lights={[{x: bulb.x, y: bulb.y + 300, r: 900, rx: 1000, color: '#ffd890', glow: 0.5}]} />
		</g>
	);
};

/** Night forest path towards the rock, lit only by flashlights. */
export const ForestPath: React.FC<{beams: {x: number; y: number; angle: number; on?: number}[]; darkness?: number; scroll?: number; owl?: number; over?: React.ReactNode; lights?: Light[]}> = ({
	beams,
	darkness = 0.84,
	scroll = 0,
	owl = 0,
	over,
	lights = [],
}) => (
	<g>
		<Sky stops={[[0, '#03040c'], [0.5, '#0a0d26'], [1, '#141838']]} />
		<Stars count={90} top={-600} bottom={700} seed={5} />
		<Forest count={40} y={1100} hMin={380} hMax={560} color="#0b1222" seed={3} offset={scroll * 0.3} x0={-900} x1={2400} sway={1} />
		{owl > 0 && (
			<g opacity={owl}>
				{[-1, 1].map((s) => (
					<circle key={s} cx={980 + s * 16} cy={620} r={8} fill="#ffd34a" />
				))}
			</g>
		)}
		<Ground y={1120} top="#1a1a22" bottom="#101016" />
		<path d={`M 300 2000 Q 520 1500 560 1120 L 620 1120 Q 700 1500 900 2000 Z`} fill="#2a2620" />
		<Forest count={18} y={1380} hMin={560} hMax={760} color="#070b16" seed={8} offset={scroll * 0.8} x0={-900} x1={2600} sway={1.5} skip={[250, 830]} />
		<GrassTufts y0={1130} y1={1900} count={40} color="#1c2418" seed={2} />
		{over}
		<Fog y={1250} color="#7a86b0" opacity={0.3} speed={0.6} />
		<Darkness opacity={darkness} color="#020309" lights={[{x: 540, y: 1550, r: 700, rx: 800, color: '#7a8cff', glow: 0.25}, ...beams.map((b) => ({x: b.x + Math.cos((b.angle * Math.PI) / 180) * 380, y: b.y + Math.sin((b.angle * Math.PI) / 180) * 380, r: 300 * (b.on ?? 1), color: '#fff6d0', glow: 0.45})), ...lights]} />
		{beams.map((b, i) => (
			<Beam key={i} x={b.x} y={b.y} angle={b.angle} length={760} spread={12} intensity={0.3 * (b.on ?? 1)} />
		))}
		<Fireflies area={[-100, 900, 1280, 500]} opacity={0.4} />
	</g>
);

/** Names carved on the rock (the 2006 group). */
export const Carvings: React.FC<{x?: number; y?: number; reveal?: number; strike?: number}> = ({x = 540, y = 800, reveal = 1, strike = 1}) => {
	const names = ['PABLO', 'RAÚL', 'SERGIO', 'JAVI', 'LUIS', 'HUGO'];
	return (
		<g transform={`translate(${x} ${y}) rotate(-3)`} opacity={reveal}>
			{names.map((n, i) => {
				const col = i % 2;
				const row = Math.floor(i / 2);
				const tx = -170 + col * 330;
				const ty = row * 110;
				return (
					<g key={n}>
						<text x={tx} y={ty} textAnchor="middle" fontFamily="InterBlack" fontSize={76} fill="#2b2530" stroke="#8d8392" strokeWidth={3} letterSpacing={6} opacity={0.9}>
							{n}
						</text>
						{n === 'HUGO' && <line x1={tx - 130} x2={tx - 130 + 260 * strike} y1={ty - 26} y2={ty - 22} stroke="#1b161e" strokeWidth={12} strokeLinecap="round" />}
					</g>
				);
			})}
			<text x={0} y={-100} textAnchor="middle" fontFamily="InterBlack" fontSize={56} fill="#2b2530" stroke="#8d8392" strokeWidth={3}>
				2006
			</text>
		</g>
	);
};

export {Pine, Stars, Fireflies};
export type {Pose};
