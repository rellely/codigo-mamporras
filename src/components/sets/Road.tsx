import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Character, CharId, Pose} from '../Character';
import {Darkness, Fireflies, Light} from '../env/Camp';
import {Fog, Forest, Ground, GrassTufts, Moon, Sky, Stars} from '../env/Nature';
import {rand} from '../../lib/anim';

const NIGHT: [number, string][] = [[0, '#03040b'], [0.55, '#0a0d24'], [1, '#151836']];

/** Side-scrolling night forest for chases. scroll grows with time (px). */
export const ForestRun: React.FC<{scroll: number; darkness?: number; lights?: Light[]; children?: React.ReactNode; front?: React.ReactNode}> = ({
	scroll,
	darkness = 0.74,
	lights = [],
	children,
	front,
}) => {
	const trunks = (n: number, seed: number, speed: number, y: number, hMin: number, hMax: number, w: number, color: string) => (
		<g>
			{new Array(n).fill(0).map((_, i) => {
				const span = 2600;
				const x = (((rand(i, seed) * span - scroll * speed) % span) + span) % span - 700;
				const h = hMin + rand(i, seed + 1) * (hMax - hMin);
				const ww = w * (0.7 + rand(i, seed + 2) * 0.6);
				return (
					<g key={i}>
						<rect x={x - ww / 2} y={y - h} width={ww} height={h + 40} fill={color} />
						<path d={`M ${x} ${y - h * 0.55} l ${ww * 1.6} ${-ww * 1.1}`} stroke={color} strokeWidth={ww * 0.25} />
						<path d={`M ${x} ${y - h * 0.75} l ${-ww * 1.4} ${-ww * 0.9}`} stroke={color} strokeWidth={ww * 0.2} />
					</g>
				);
			})}
		</g>
	);
	return (
		<g>
			<Sky stops={NIGHT} />
			<Stars count={110} top={-700} bottom={700} seed={21} />
			<Moon x={820} y={280} r={50} />
			<Forest count={50} y={1180} hMin={420} hMax={620} color="#0a1020" seed={7} offset={scroll * 0.15} x0={-1200} x1={4200} sway={0} />
			{trunks(16, 40, 0.45, 1460, 700, 1000, 46, '#0c111c')}
			<Ground y={1460} top="#17161a" bottom="#0c0b0e" />
			<GrassTufts y0={1470} y1={1900} count={40} color="#1c2418" seed={11} x0={-200 - (scroll * 0.9) % 300} x1={1500 - (scroll * 0.9) % 300} />
			{children}
			<Fog y={1380} color="#5a6690" opacity={0.3} speed={1.2} height={140} />
			<Fireflies area={[-100, 900, 1280, 500]} opacity={0.3} />
			<Darkness opacity={darkness} color="#020309" lights={[{x: 820, y: 400, r: 900, color: '#8a9cff', glow: 0.12}, {x: 500, y: 1350, r: 700, rx: 900, color: '#7a8cff', glow: 0.15}, ...lights]} />
			{front}
			{trunks(3, 77, 1.9, 2050, 1600, 1900, 80, '#020306')}
		</g>
	);
};

/** Night road, side view. Asphalt band between 1440 and 1620. */
export const ROAD_Y = 1540;
export const RoadNight: React.FC<{scroll: number; darkness?: number; lights?: Light[]; children?: React.ReactNode; sign?: {x: number; text: string}}> = ({
	scroll,
	darkness = 0.85,
	lights = [],
	children,
	sign,
}) => (
	<g>
		<Sky stops={NIGHT} />
		<Stars count={120} top={-700} bottom={800} seed={33} />
		<Moon x={260} y={300} r={52} />
		<Forest count={50} y={1260} hMin={300} hMax={460} color="#080d1a" seed={17} offset={scroll * 0.3} x0={-1200} x1={4200} sway={0} />
		<Ground y={1250} top="#1a1a1c" bottom="#121214" />
		{/* guardrail */}
		<rect x={-800} y={1380} width={2800} height={16} fill="#6a6e76" />
		{new Array(30).fill(0).map((_, i) => {
			const x = ((((i * 160 - scroll) % 2800) + 2800) % 2800) - 800;
			return <rect key={i} x={x} y={1380} width={12} height={70} fill="#4a4e56" />;
		})}
		{sign && (
			<g transform={`translate(${sign.x - scroll} 1380)`}>
				<rect x={-6} y={-280} width={14} height={280} fill="#6a6e76" />
				<rect x={-180} y={-380} width={360} height={110} rx={10} fill="#1f6a3a" stroke="#e8e8e8" strokeWidth={6} />
				<text x={0} y={-312} textAnchor="middle" fontFamily="InterBlack" fontSize={40} fill="#f2f2f2">
					{sign.text}
				</text>
			</g>
		)}
		<rect x={-800} y={1440} width={2800} height={190} fill="#232327" />
		{new Array(24).fill(0).map((_, i) => {
			const x = ((((i * 220 - scroll * 1.0) % 2640) + 2640) % 2640) - 800;
			return <rect key={i} x={x} y={1530} width={110} height={10} fill="#d8c86a" opacity={0.8} />;
		})}
		<Ground y={1630} top="#151517" bottom="#0c0c0e" />
		{children}
		<Darkness opacity={darkness} color="#020309" lights={[{x: 260, y: 400, r: 800, color: '#8a9cff', glow: 0.12}, ...lights]} />
	</g>
);

/** Seated passengers sit high enough for their heads to clear the bed wall. */
export const PASSENGER_Y = -140;

/** Old pickup truck, side view facing right. Origin = ground under the rear wheel. */
export const Pickup: React.FC<{x: number; y: number; s?: number; wheel: number; headlights?: number; driver?: Pose; driverId?: CharId | null; passengers?: {id: CharId; dx: number; pose?: Pose}[]}> = ({
	driverId = 'tomas',
	x,
	y,
	s = 1,
	wheel,
	headlights = 1,
	driver = {},
	passengers = [],
}) => {
	const frame = useCurrentFrame();
	const bob = Math.sin(frame / 3) * 2;
	const wheelEl = (wx: number) => (
		<g transform={`translate(${wx} -70) rotate(${wheel})`}>
			<circle r={70} fill="#111" />
			<circle r={36} fill="#7a7e86" />
			{[0, 72, 144, 216, 288].map((a) => (
				<rect key={a} x={-4} y={-34} width={8} height={30} fill="#3a3c42" transform={`rotate(${a})`} />
			))}
		</g>
	);
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			{headlights > 0 && <polygon points={`700,-170 1500,-260 1500,10 700,-130`} fill="#fff6c8" opacity={0.22 * headlights} />}
			<g transform={`translate(0 ${bob})`}>
				{/* passengers in the bed (behind bed wall) */}
				{passengers.map((p) => (
					<Character key={p.id} id={p.id} x={-40 + p.dx} y={PASSENGER_Y} scale={0.62} pose={{sit: true, ...(p.pose ?? {})}} />
				))}
				<path d="M -160 -90 L -160 -250 L 380 -250 L 380 -90 Z" fill="#2f4a3a" />
				<rect x={-170} y={-262} width={560} height={22} rx={6} fill="#3d5c49" />
				{/* cab */}
				<path d="M 380 -90 L 380 -380 L 560 -380 L 650 -250 L 760 -240 Q 790 -236 790 -200 L 790 -90 Z" fill="#355442" />
				<path d="M 400 -360 L 548 -360 L 622 -255 L 400 -255 Z" fill="#0d1620" />
				<svg x={400} y={-360} width={222} height={105} viewBox="0 0 222 105" overflow="hidden">
					{driverId && <Character id={driverId} x={100} y={240} scale={0.55} pose={{turn: 0.5, ...driver}} />}
				</svg>
				<path d="M 400 -360 L 548 -360 L 622 -255 L 400 -255 Z" fill="#9fc8e8" opacity={0.12} />
				<rect x={750} y={-200} width={36} height={26} rx={6} fill="#fff3b0" />
				<rect x={-180} y={-150} width={22} height={30} rx={4} fill="#c0221e" />
				<rect x={-170} y={-100} width={970} height={24} rx={8} fill="#1d2a22" />
				{wheelEl(0)}
				{wheelEl(620)}
			</g>
		</g>
	);
};

/** Looking back from the truck bed: road receding to the horizon. */
export const RoadBack: React.FC<{t: number; figure: number; children?: React.ReactNode}> = ({t, figure, children}) => {
	const vp = {x: 540, y: 1060};
	const dash = new Array(10).fill(0).map((_, i) => {
		const k = ((i / 10 + t * 0.9) % 1);
		const y = vp.y + (1 - k) * (1 - k) * 900;
		const w = 6 + (1 - k) * 22;
		const h = 10 + (1 - k) * 70;
		return <rect key={i} x={vp.x - w / 2} y={y} width={w} height={h} fill="#d8c86a" opacity={0.9} />;
	});
	return (
		<g>
			<Sky stops={NIGHT} />
			<Stars count={120} top={-700} bottom={900} seed={41} />
			<Moon x={830} y={360} r={46} />
			<Forest count={40} y={1080} hMin={260} hMax={420} color="#070b16" seed={23} x0={-600} x1={360} sway={0} />
			<Forest count={40} y={1080} hMin={260} hMax={420} color="#070b16" seed={29} x0={720} x1={1700} sway={0} />
			<Ground y={1060} top="#121214" bottom="#0c0c0e" />
			<polygon points={`${vp.x - 14},${vp.y} ${vp.x + 14},${vp.y} 1300,2000 -220,2000`} fill="#202024" />
			{dash}
			<g transform={`translate(${vp.x} ${vp.y + 6}) scale(${figure})`}>
				<Character id="masked" x={0} y={0} scale={1} pose={{item: 'hook', armR: [12, -10], glowEyes: 1}} />
			</g>
			<polygon points="-200,2000 1280,2000 1280,1700 -200,1700" fill="#c0221e" opacity={0} />
			<Darkness opacity={0.8} color="#020309" lights={[{x: vp.x, y: 1500, r: 700, color: '#ff4a3a', glow: 0.35}, {x: 830, y: 360, r: 700, color: '#8a9cff', glow: 0.12}]} />
			{children}
		</g>
	);
};
