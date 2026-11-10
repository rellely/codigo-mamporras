import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Campfire, Darkness, Fireflies, Light, Log, Smoke, useFlicker} from '../env/Camp';
import {Bird, Fog, Forest, Ground, GrassTufts, Moon, Sky, Stars, Sun} from '../env/Nature';
import {rand} from '../../lib/anim';

export type Time = 'day' | 'sunset' | 'night';

const PAL: Record<Time, {sky: [number, string][]; far: string; water: [string, string]; ground: [string, string]; tree: string; glint: string}> = {
	day: {sky: [[0, '#5ea4e6'], [0.6, '#a8d4f2'], [1, '#d8eef8']], far: '#2f5a45', water: ['#4f8fb8', '#2a5a7a'], ground: ['#6a8a4a', '#4a6a34'], tree: '#24452f', glint: '#ffffff'},
	sunset: {sky: [[0, '#2a1a4f'], [0.35, '#7a3a78'], [0.6, '#e8697a'], [0.8, '#ffb46b'], [1, '#ffd9a0']], far: '#3a2244', water: ['#c86a7a', '#4a2a52'], ground: ['#5a3a3a', '#2e1e24'], tree: '#24142c', glint: '#ffd9a0'},
	night: {sky: [[0, '#04050d'], [0.55, '#0b0e28'], [1, '#18183a']], far: '#070a16', water: ['#121a36', '#05070f'], ground: ['#1f1e1c', '#121110'], tree: '#060912', glint: '#dfe8ff'},
};

/** Lake surface between y0 and y1 with moving reflection streaks. */
export const Water: React.FC<{y0: number; y1: number; time: Time; glintX?: number}> = ({y0, y1, time, glintX = 760}) => {
	const frame = useCurrentFrame();
	const id = useId().replace(/:/g, '');
	const P = PAL[time];
	return (
		<g>
			<defs>
				<linearGradient id={`wt${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={P.water[0]} />
					<stop offset="100%" stopColor={P.water[1]} />
				</linearGradient>
			</defs>
			<rect x={-1500} y={y0} width={4100} height={y1 - y0} fill={`url(#wt${id})`} />
			{/* reflection of the far treeline */}
			<g opacity={0.35} transform={`translate(0 ${2 * y0}) scale(1 -1)`}>
				<Forest count={50} y={y0 + 4} hMin={70} hMax={140} color={P.far} seed={31} x0={-1200} x1={2400} sway={0} />
			</g>
			{new Array(46).fill(0).map((_, i) => {
				const yy = y0 + 8 + ((i * 37) % (y1 - y0 - 10));
				const k = (yy - y0) / (y1 - y0);
				const near = Math.abs(((i * 53) % 900) - 450) < 150 ? 1 : 0;
				const x = glintX + (rand(i, 2) - 0.5) * (120 + k * 520) + Math.sin(frame / 20 + i) * 18;
				const w = 30 + k * 160 * rand(i, 3);
				return <rect key={i} x={x - w / 2} y={yy} width={w} height={2 + k * 4} rx={2} fill={P.glint} opacity={(0.12 + 0.25 * rand(i, 4)) * (0.6 + 0.4 * Math.sin(frame / 8 + i)) * (near ? 1.3 : 1)} />;
			})}
		</g>
	);
};

/** Wooden dock in perspective, from the shore (bottom) out into the lake. */
export const DOCK = {nearY: 1640, farY: 1090, nearL: 560, nearR: 820, farL: 678, farR: 726};
export const dockAt = (t: number) => ({
	// t = 0 near end, 1 far end
	y: DOCK.nearY + (DOCK.farY - DOCK.nearY) * Math.pow(t, 0.7),
	cx: (DOCK.nearL + DOCK.nearR) / 2 + (((DOCK.farL + DOCK.farR) / 2 - (DOCK.nearL + DOCK.nearR) / 2) * t),
	s: 1 - 0.78 * Math.pow(t, 0.8),
});
export const Dock: React.FC<{time: Time}> = ({time}) => {
	const D = DOCK;
	const plank = time === 'night' ? '#3a2e24' : '#8a6a48';
	const dark = time === 'night' ? '#1e1812' : '#5a4430';
	return (
		<g>
			{[0.15, 0.45, 0.8, 1].map((t, i) => {
				const p = dockAt(t);
				const half = ((D.nearR - D.nearL) / 2) * p.s;
				return (
					<g key={i}>
						<rect x={p.cx - half - 6 * p.s} y={p.y} width={12 * p.s} height={70 * p.s} fill={dark} />
						<rect x={p.cx + half - 6 * p.s} y={p.y} width={12 * p.s} height={70 * p.s} fill={dark} />
					</g>
				);
			})}
			<polygon points={`${D.nearL},${D.nearY} ${D.nearR},${D.nearY} ${D.farR},${D.farY} ${D.farL},${D.farY}`} fill={plank} />
			{new Array(26).fill(0).map((_, i) => {
				const t = i / 25;
				const p = dockAt(t);
				const half = ((D.nearR - D.nearL) / 2) * p.s;
				return <line key={i} x1={p.cx - half} x2={p.cx + half} y1={p.y} y2={p.y} stroke={dark} strokeWidth={Math.max(1, 4 * p.s)} />;
			})}
			<polygon points={`${D.nearR},${D.nearY} ${D.nearR + 14},${D.nearY + 16} ${D.farR + 2},${D.farY + 4} ${D.farR},${D.farY}`} fill={dark} />
		</g>
	);
};

/** Lake view: sky, far shore, water, dock. Children render on top (before lighting). */
export const LakeView: React.FC<{time: Time; children?: React.ReactNode; darkness?: number; lights?: Light[]; fog?: number; canoe?: boolean; farFigure?: {x: number; y: number; s: number}}> = ({
	time,
	children,
	darkness,
	lights = [],
	fog = 0.3,
	canoe = true,
	farFigure,
}) => {
	const frame = useCurrentFrame();
	const P = PAL[time];
	return (
		<g>
			<Sky stops={P.sky} />
			{time === 'night' && <Stars count={150} top={-700} bottom={850} seed={9} />}
			{time === 'night' && <Moon x={760} y={330} r={62} />}
			{time === 'sunset' && <Sun x={760} y={930} r={110} />}
			{time === 'day' && <Sun x={850} y={300} r={80} color="#fff6d8" glow="#fff3c0" />}
			{time !== 'night' && [0, 1, 2].map((i) => <Bird key={i} x={((frame * (3 + i) + i * 400) % 1600) - 300} y={500 + i * 60} s={0.8} phase={i} color={time === 'day' ? '#2a3a4a' : '#2a1830'} />)}
			<Forest count={60} y={1000} hMin={90} hMax={170} color={P.far} seed={31} x0={-1200} x1={2400} sway={0} />
			{farFigure && <FarFigure {...farFigure} />}
			<Water y0={1000} y1={1700} time={time} />
			{canoe && (
				<g transform={`translate(${300 + Math.sin(frame / 40) * 6} ${1180 + Math.sin(frame / 25) * 3})`}>
					<path d="M -120 0 Q 0 30 120 0 Q 100 22 0 26 Q -100 22 -120 0 Z" fill={time === 'night' ? '#3a1a14' : '#b5452a'} />
					<line x1={-60} y1={-10} x2={60} y2={20} stroke={time === 'night' ? '#2a1a10' : '#6a4a2a'} strokeWidth={6} />
				</g>
			)}
			<Dock time={time} />
			{children}
			{fog > 0 && <Fog y={1050} color={time === 'night' ? '#8a94c0' : '#ffe6d6'} opacity={fog} speed={0.5} height={120} />}
			{darkness !== undefined && <Darkness opacity={darkness} color="#03040a" lights={[{x: 760, y: 700, r: 900, color: '#9fb4ff', glow: 0.15}, ...lights]} />}
		</g>
	);
};

/** Tiny figure on the far shore (easter egg). */
export const FarFigure: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<rect x={-30} y={-150} width={60} height={110} rx={20} fill="#d9b32a" />
		<circle cx={0} cy={-175} r={34} fill="#d9b32a" />
		<ellipse cx={0} cy={-170} rx={20} ry={24} fill="#cdb38a" />
		<rect x={-24} y={-40} width={16} height={40} fill="#2a2a26" />
		<rect x={8} y={-40} width={16} height={40} fill="#2a2a26" />
		<line x1={44} y1={0} x2={44} y2={-230} stroke="#5a3e26" strokeWidth={8} />
	</g>
);

/** Log cabin; origin bottom-centre. lit = window light 0..1. */
export const Cabin: React.FC<{x: number; y: number; s?: number; lit?: number; door?: number}> = ({x, y, s = 1, lit = 0, door = 0}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<rect x={-170} y={-200} width={340} height={200} fill="#6b4a30" />
		{[0, 1, 2, 3, 4, 5, 6].map((i) => (
			<line key={i} x1={-170} x2={170} y1={-190 + i * 28} y2={-190 + i * 28} stroke="#4a3220" strokeWidth={5} />
		))}
		<path d="M -200 -195 L 0 -330 L 200 -195 Z" fill="#3a2a22" />
		<path d="M -200 -195 L 0 -330 L 0 -300 L -170 -190 Z" fill="#4a3a2e" />
		<rect x={-130} y={-150} width={80} height={70} fill={lit > 0 ? '#ffcf7a' : '#11131c'} opacity={lit > 0 ? 0.5 + lit * 0.5 : 1} />
		<line x1={-90} x2={-90} y1={-150} y2={-80} stroke="#3a2a1a" strokeWidth={6} />
		<rect x={-130} y={-150} width={80} height={70} fill="none" stroke="#3a2a1a" strokeWidth={8} />
		<rect x={20} y={-140} width={90} height={140} fill="#2a1c12" />
		<rect x={20 + 90 * door} y={-140} width={90 * (1 - door)} height={140} fill="#5a3a24" />
		<circle cx={30 + 90 * door + 66 * (1 - door)} cy={-70} r={6} fill="#c9a66b" />
		<rect x={-180} y={-6} width={360} height={14} fill="#3a2a1a" />
	</g>
);

/** Wooden entrance arch with the camp name. */
export const CampSign: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<rect x={-330} y={-520} width={34} height={520} fill="#5a3e26" />
		<rect x={296} y={-520} width={34} height={520} fill="#5a3e26" />
		<rect x={-360} y={-560} width={720} height={130} rx={10} fill="#7a5638" stroke="#4a3220" strokeWidth={10} />
		<text x={0} y={-512} textAnchor="middle" fontFamily="InterBlack" fontSize={44} fill="#f1e2c0" letterSpacing={4}>
			CAMPAMENTO
		</text>
		<text x={0} y={-456} textAnchor="middle" fontFamily="InterBlack" fontSize={56} fill="#f1e2c0" letterSpacing={6}>
			LAGO NEGRO
		</text>
		<path d="M -250 -440 l 40 50 M 230 -440 l -30 60" stroke="#4a3220" strokeWidth={6} />
		<rect x={180} y={-520} width={70} height={8} fill="#b5452a" transform="rotate(12 210 -516)" />
	</g>
);

/** String of bulbs between two points; on = 0..1. */
export const StringLights: React.FC<{x0: number; y0: number; x1: number; y1: number; sag?: number; on: number}> = ({x0, y0, x1, y1, sag = 90, on}) => {
	const pts = new Array(13).fill(0).map((_, i) => {
		const t = i / 12;
		return {x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t + Math.sin(Math.PI * t) * sag};
	});
	return (
		<g>
			<path d={`M ${x0} ${y0} Q ${(x0 + x1) / 2} ${(y0 + y1) / 2 + sag * 2} ${x1} ${y1}`} stroke="#151515" strokeWidth={4} fill="none" />
			{pts.map((p, i) => (
				<g key={i}>
					{on > 0 && <circle cx={p.x} cy={p.y + 14} r={26} fill="#ffd27a" opacity={0.25 * on} />}
					<circle cx={p.x} cy={p.y + 14} r={9} fill={on > 0 ? '#ffe1a0' : '#3a3a3a'} opacity={on > 0 ? 0.4 + 0.6 * on : 1} />
				</g>
			))}
		</g>
	);
};

export const LN_FIRE = {x: 540, y: 1440};
/** Seats around the lakeside campfire (same layout grammar as the night camp). */
export const LN_SEATS: Record<string, {x: number; y: number}> = {
	mateo: {x: 135, y: 1335},
	lucia: {x: 298, y: 1268},
	carlos: {x: 458, y: 1240},
	vera: {x: 622, y: 1240},
	alex: {x: 790, y: 1268},
	bea: {x: 955, y: 1335},
};

/** Lakeside campsite at night: lake behind, cabins, string lights, campfire. */
export const LakeCampNight: React.FC<{
	fire?: number;
	power?: number; // 1 = cabins + bulbs lit
	darkness?: number;
	lights?: Light[];
	under?: React.ReactNode;
	over?: React.ReactNode;
	farFigure?: {x: number; y: number; s: number};
}> = ({fire = 1, power = 1, darkness = 0.88, lights = [], under, over, farFigure}) => {
	const flick = useFlicker(0.1, 'ln');
	const r = 620 * flick * (0.3 + 0.7 * fire);
	return (
		<g>
			<Sky stops={PAL.night.sky} />
			<Stars count={150} top={-700} bottom={760} seed={9} />
			<Moon x={820} y={260} r={56} />
			<Forest count={60} y={900} hMin={90} hMax={170} color={PAL.night.far} seed={31} x0={-1200} x1={2400} sway={0} />
			{farFigure && <FarFigure {...farFigure} />}
			<Water y0={900} y1={1150} time="night" glintX={820} />
			<Ground y={1150} top="#22201c" bottom="#141311" />
			<Cabin x={60} y={1215} s={0.8} lit={power} />
			<Cabin x={1030} y={1215} s={0.8} lit={power} />
			<line x1={180} y1={760} x2={180} y2={1210} stroke="#2a1e14" strokeWidth={12} />
			<line x1={900} y1={760} x2={900} y2={1210} stroke="#2a1e14" strokeWidth={12} />
			<StringLights x0={180} y0={770} x1={900} y1={770} sag={80} on={power} />
			<GrassTufts y0={1160} y1={1900} count={40} color="#2a3326" seed={8} />
			{under}
			<Campfire x={LN_FIRE.x} y={LN_FIRE.y} intensity={fire} />
			<Smoke x={LN_FIRE.x} y={LN_FIRE.y - 120} amount={0.25} />
			<Fireflies area={[-100, 1000, 1280, 400]} opacity={0.5} />
			{over}
			<Darkness
				opacity={darkness}
				color="#03040a"
				lights={[
					{x: LN_FIRE.x, y: LN_FIRE.y - 160, r, rx: r * 1.15, glow: fire},
					...(power > 0
						? [
								{x: 540, y: 860, r: 520 * power, rx: 620 * power, color: '#ffd27a', glow: 0.35 * power},
								{x: 30, y: 1110, r: 160 * power, color: '#ffcf7a', glow: 0.4 * power},
								{x: 960, y: 1110, r: 160 * power, color: '#ffcf7a', glow: 0.4 * power},
						  ]
						: []),
					...lights,
				]}
			/>
		</g>
	);
};

/** Camp entrance in daylight. */
export const CampEntrance: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<g>
		<Sky stops={PAL.day.sky} />
		<Sun x={880} y={260} r={70} color="#fff6d8" glow="#fff3c0" />
		<Forest count={40} y={1050} hMin={260} hMax={420} color="#2f5a45" seed={12} sway={1} highlight="#9fd08a" />
		<Ground y={1040} top="#7a9a52" bottom="#55753a" />
		<path d="M 380 2000 Q 520 1400 520 1040 L 600 1040 Q 640 1400 820 2000 Z" fill="#b59a6a" />
		<Cabin x={140} y={1120} s={0.6} />
		<Cabin x={950} y={1120} s={0.6} />
		<CampSign x={560} y={1150} s={0.95} />
		<GrassTufts y0={1050} y1={1900} count={60} color="#4a6a30" seed={3} />
		{children}
		<Forest count={4} y={2150} hMin={1000} hMax={1200} color="#1a3022" seed={44} x0={-900} x1={2300} sway={0} skip={[-200, 1300]} />
	</g>
);

/** Generator shed at night, door open. Origin: whole world. */
export const SHED = {x: 540, y: 1420, door: {x: 330, y: 820, w: 230, h: 600}};
export const Shed: React.FC<{generatorOn?: number; figure?: number; darkness?: number; lights?: Light[]; children?: React.ReactNode}> = ({
	generatorOn = 0,
	figure = 0,
	darkness = 0.9,
	lights = [],
	children,
}) => {
	const frame = useCurrentFrame();
	const D = SHED.door;
	const shake = generatorOn * Math.sin(frame * 3) * 1.5;
	return (
		<g>
			{/* interior back wall (we look out through the door) */}
			<rect x={-800} y={-800} width={2700} height={2300} fill="#2a2018" />
			{new Array(30).fill(0).map((_, i) => (
				<line key={i} x1={-800 + i * 90} x2={-800 + i * 90} y1={-800} y2={1500} stroke="#1c150f" strokeWidth={8} />
			))}
			{/* open door: night outside */}
			<rect x={D.x} y={D.y} width={D.w} height={D.h} fill="#070a16" />
			<svg x={D.x} y={D.y} width={D.w} height={D.h} viewBox={`0 0 ${D.w} ${D.h}`}>
				<Stars count={20} top={0} bottom={240} xMin={0} xMax={D.w} seed={4} />
				<Forest count={6} y={460} hMin={260} hMax={380} color="#03050c" seed={6} x0={-100} x1={D.w + 100} sway={1} />
				<rect y={460} width={D.w} height={200} fill="#0c0d10" />
				{figure > 0 && (
					<g opacity={figure}>
						<rect x={70} y={190} width={110} height={300} rx={34} fill="#6a5a1e" />
						<circle cx={125} cy={160} r={56} fill="#6a5a1e" />
						<ellipse cx={125} cy={168} rx={34} ry={40} fill="#5e5242" />
						<circle cx={110} cy={158} r={6} fill="#000" />
						<circle cx={140} cy={158} r={6} fill="#000" />
						<line x1={200} y1={520} x2={200} y2={40} stroke="#2a1e12" strokeWidth={12} />
						<path d="M 200 50 q 0 -40 34 -40 q 26 0 26 26" stroke="#3a3a36" strokeWidth={10} fill="none" />
					</g>
				)}
			</svg>
			<rect x={D.x - 20} y={D.y - 20} width={D.w + 40} height={D.h + 20} fill="none" stroke="#3a2a1c" strokeWidth={24} />
			{/* floor */}
			<rect x={-800} y={1420} width={2700} height={900} fill="#1a1612" />
			{/* shelves + cans */}
			<rect x={650} y={760} width={360} height={16} fill="#4a3a2a" />
			{[0, 1, 2].map((i) => (
				<rect key={i} x={680 + i * 110} y={680} width={70} height={80} rx={6} fill={['#b5452a', '#2a6a3a', '#b5452a'][i]} />
			))}
			{/* generator */}
			<g transform={`translate(${760 + shake} 1420)`}>
				<rect x={-170} y={-230} width={340} height={230} rx={16} fill="#c94a2a" />
				<rect x={-150} y={-210} width={180} height={150} rx={10} fill="#2a2a2a" />
				{[0, 1, 2, 3, 4].map((i) => (
					<line key={i} x1={-140} x2={20} y1={-195 + i * 30} y2={-195 + i * 30} stroke="#444" strokeWidth={6} />
				))}
				<circle cx={100} cy={-160} r={14} fill={generatorOn > 0.5 ? '#7CFF8A' : '#ff3a3a'} opacity={0.6 + 0.4 * Math.sin(frame / 3)} />
				<rect x={60} y={-110} width={90} height={60} rx={6} fill="#3a3a3a" />
				<rect x={-180} y={-12} width={360} height={14} fill="#1a1a1a" />
			</g>
			{children}
			<Darkness opacity={darkness} color="#020305" lights={[{x: D.x + D.w / 2, y: D.y + 200, r: 300, color: '#7a8cff', glow: 0.15}, ...lights]} />
		</g>
	);
};

export {Log, Fog, noise2D};

/** Tall reeds by the shore; draw in front of hidden characters. */
export const Reeds: React.FC<{y0: number; y1: number; count: number; seed?: number; color?: string; x0?: number; x1?: number}> = ({y0, y1, count, seed = 5, color = '#1d2a1a', x0 = -200, x1 = 1280}) => {
	const frame = useCurrentFrame();
	return (
		<g>
			{new Array(count).fill(0).map((_, i) => {
				const x = x0 + rand(i, seed) * (x1 - x0);
				const base = y0 + rand(i, seed + 1) * (y1 - y0);
				const h = 260 + rand(i, seed + 2) * 260;
				const sw = Math.sin(frame / 28 + i) * 14 + noise2D('rd' + i, frame * 0.01, 0) * 10;
				return (
					<g key={i}>
						<path d={`M ${x - 8} ${base} Q ${x + sw * 0.5} ${base - h * 0.6} ${x + sw} ${base - h} L ${x + 8} ${base} Z`} fill={color} />
						{rand(i, seed + 3) > 0.6 && <ellipse cx={x + sw} cy={base - h + 10} rx={7} ry={26} fill="#3a2a1a" />}
					</g>
				);
			})}
		</g>
	);
};

/** Interior of the old boathouse. */
export const BOATHOUSE = {door: {x: 830, y: 880, w: 220, h: 620}, photo: {x: 380, y: 560, w: 340, h: 250}, boat: {x: 300, y: 1500}};
export const Boathouse: React.FC<{
	doorOpen?: number;
	doorShake?: number;
	hook?: number; // 0..1 hook tip pierced through the door
	darkness?: number;
	lights?: Light[];
	photo?: React.ReactNode;
	children?: React.ReactNode;
	front?: React.ReactNode;
}> = ({doorOpen = 0, doorShake = 0, hook = 0, darkness = 0.9, lights = [], photo, children, front}) => {
	const frame = useCurrentFrame();
	const D = BOATHOUSE.door;
	const P = BOATHOUSE.photo;
	const shake = doorShake * Math.sin(frame * 2.3) * 6;
	return (
		<g>
			<rect x={-800} y={-800} width={2700} height={2400} fill="#2c2119" />
			{new Array(32).fill(0).map((_, i) => (
				<line key={i} x1={-800 + i * 85} x2={-800 + i * 85} y1={-800} y2={1500} stroke="#1e1610" strokeWidth={7} />
			))}
			{/* moonlit window */}
			<rect x={80} y={600} width={220} height={240} fill="#0d1636" />
			<circle cx={230} cy={660} r={26} fill="#e8ecff" opacity={0.8} />
			<line x1={190} x2={190} y1={600} y2={840} stroke="#3a2a1c" strokeWidth={10} />
			<line x1={80} x2={300} y1={720} y2={720} stroke="#3a2a1c" strokeWidth={10} />
			<rect x={80} y={600} width={220} height={240} fill="none" stroke="#3a2a1c" strokeWidth={16} />
			{/* old staff photo */}
			<g>
				<rect x={P.x - 16} y={P.y - 16} width={P.w + 32} height={P.h + 32} fill="#5a3e26" />
				<g style={{filter: 'sepia(0.45) contrast(1.05) saturate(1.2)'}}>
					<svg x={P.x} y={P.y} width={P.w} height={P.h} viewBox="0 0 1080 794" preserveAspectRatio="xMidYMid slice">
						{photo}
					</svg>
				</g>
				<rect x={P.x + 70} y={P.y + P.h + 28} width={200} height={34} fill="#d8ccb0" />
				<text x={P.x + 170} y={P.y + P.h + 52} textAnchor="middle" fontFamily="InterBlack" fontSize={17} fill="#3a2a1a">
					PERSONAL · VERANO 1996
				</text>
			</g>
			{/* oars */}
			<line x1={760} y1={560} x2={980} y2={820} stroke="#7a5a3a" strokeWidth={12} />
			<ellipse cx={985} cy={826} rx={20} ry={44} fill="#7a5a3a" transform="rotate(-40 985 826)" />
			<line x1={980} y1={560} x2={760} y2={820} stroke="#6a4a2a" strokeWidth={12} />
			<ellipse cx={756} cy={826} rx={20} ry={44} fill="#6a4a2a" transform="rotate(40 756 826)" />
			{/* door (right) */}
			<rect x={D.x} y={D.y} width={D.w} height={D.h} fill="#0a0f1e" />
			<g transform={`translate(${D.x + shake} ${D.y}) scale(${1 - doorOpen * 0.85} 1)`}>
				<rect width={D.w} height={D.h} fill="#5a3a24" />
				{[0, 1, 2, 3].map((i) => (
					<line key={i} x1={i * 55 + 27} x2={i * 55 + 27} y1={0} y2={D.h} stroke="#3e2816" strokeWidth={6} />
				))}
				<rect x={0} y={120} width={D.w} height={22} fill="#3e2816" />
				<rect x={0} y={460} width={D.w} height={22} fill="#3e2816" />
				<circle cx={30} cy={320} r={9} fill="#c9a66b" />
				{hook > 0 && (
					<g opacity={Math.min(1, hook * 2)}>
						<path d={`M 90 ${300 - hook * 10} l -14 -30 l 22 8 l 10 -26 l 8 34 z`} fill="#2a1a0e" />
						<path d={`M 110 300 q ${-60 * hook} -10 ${-80 * hook} ${-50 * hook}`} stroke="#8a8780" strokeWidth={14} fill="none" strokeLinecap="round" />
					</g>
				)}
			</g>
			<rect x={D.x - 14} y={D.y - 14} width={D.w + 28} height={D.h + 14} fill="none" stroke="#3a2a1c" strokeWidth={20} />
			{/* floor */}
			<rect x={-800} y={1500} width={2700} height={900} fill="#211810" />
			{new Array(10).fill(0).map((_, i) => (
				<line key={i} x1={-800} x2={1900} y1={1520 + i * 45 + i * i * 6} y2={1520 + i * 45 + i * i * 6} stroke="#160f0a" strokeWidth={5} />
			))}
			{children}
			{/* rowboat on the floor (left) — characters can hide behind it */}
			<g transform={`translate(${BOATHOUSE.boat.x} ${BOATHOUSE.boat.y})`}>
				<path d="M -330 -150 Q 0 -110 330 -150 Q 290 10 0 20 Q -290 10 -330 -150 Z" fill="#3a5a6a" />
				<path d="M -330 -150 Q 0 -110 330 -150 L 320 -126 Q 0 -90 -320 -126 Z" fill="#c8b48a" />
				<rect x={-200} y={-130} width={40} height={20} fill="#2a3a44" />
			</g>
			{front}
			<Darkness opacity={darkness} color="#020305" lights={[{x: 190, y: 720, r: 380, color: '#8a9cff', glow: 0.25}, ...lights]} />
		</g>
	);
};
