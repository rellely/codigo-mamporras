import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';

export type CharId = 'leo' | 'marta' | 'dani' | 'sara' | 'iker' | 'sixth';
export type Mouth = 'smile' | 'grin' | 'open' | 'flat' | 'worried' | 'creepy' | 'o';
export type Brows = 'neutral' | 'worried' | 'angry' | 'raised';

type Look = {
	skin: string;
	skinShade: string;
	jacket: string;
	jacketDark: string;
	pants: string;
	shoes: string;
	hair: string;
	accent: string;
	width: number;
	name: string;
};

/** The cast. Colours are fixed so every scene stays on-model. */
export const CAST: Record<CharId, Look> = {
	leo: {name: 'Leo', skin: '#f2c48d', skinShade: '#d9a36a', jacket: '#e8722e', jacketDark: '#b9531b', pants: '#34405e', shoes: '#2a2320', hair: '#5a3a22', accent: '#d63a3a', width: 1},
	marta: {name: 'Marta', skin: '#ffd9b0', skinShade: '#e8b98c', jacket: '#f2bf26', jacketDark: '#c79312', pants: '#2f3e46', shoes: '#3a2a22', hair: '#7a4426', accent: '#3a7bd5', width: 0.95},
	dani: {name: 'Dani', skin: '#c68642', skinShade: '#a56b30', jacket: '#3fa866', jacketDark: '#2b7a49', pants: '#4a3b2a', shoes: '#1f1f1f', hair: '#1b1410', accent: '#e85d3a', width: 1},
	sara: {name: 'Sara', skin: '#e3ae72', skinShade: '#c48f55', jacket: '#8c57d9', jacketDark: '#6538a8', pants: '#2b2b38', shoes: '#262626', hair: '#24182f', accent: '#38b2ac', width: 0.95},
	iker: {name: 'Iker', skin: '#8d5524', skinShade: '#6e3f17', jacket: '#1f9e95', jacketDark: '#15736c', pants: '#3a3a44', shoes: '#1a1a1a', hair: '#120d0a', accent: '#2d6cdf', width: 1.18},
	sixth: {name: '?', skin: '#dcdcd2', skinShade: '#b4b5ad', jacket: '#62666e', jacketDark: '#44474e', pants: '#26282d', shoes: '#141414', hair: '#4e5158', accent: '#4e5158', width: 1},
};

export type Pose = {
	armL?: [number, number];
	armR?: [number, number];
	legL?: [number, number];
	legR?: [number, number];
	sit?: boolean;
	bob?: number;
	lean?: number;
	headTilt?: number;
	turn?: number;
	lookX?: number;
	lookY?: number;
	blink?: number;
	mouth?: Mouth;
	brows?: Brows;
	back?: boolean;
	item?: 'phone' | 'flashlight' | null;
	itemHand?: 'L' | 'R';
	phoneLit?: number;
	backpack?: boolean;
	glowEyes?: number;
	silhouette?: string;
	tremble?: number;
	eyeOpen?: number;
	/** Override palette entries (e.g. Hugo regaining colour). */
	colors?: Partial<Look>;
	/** Normal (non-uncanny) eyes for the sixth. */
	humanEyes?: boolean;
};

const rad = (d: number) => (d * Math.PI) / 180;
const limb = (sx: number, sy: number, a1: number, a2: number, l1: number, l2: number) => {
	const ex = sx + Math.sin(rad(a1)) * l1;
	const ey = sy + Math.cos(rad(a1)) * l1;
	const hx = ex + Math.sin(rad(a1 + a2)) * l2;
	const hy = ey + Math.cos(rad(a1 + a2)) * l2;
	return {ex, ey, hx, hy};
};

const SEEDS: Record<CharId, number> = {leo: 0, marta: 23, dani: 51, sara: 77, iker: 13, sixth: 999};

export const Character: React.FC<{
	id: CharId;
	x: number;
	y: number;
	scale?: number;
	pose?: Pose;
	flip?: boolean;
	opacity?: number;
}> = ({id, x, y, scale = 1, pose = {}, flip = false, opacity = 1}) => {
	const frame = useCurrentFrame();
	const uid = useId().replace(/:/g, '');
	const L = pose.colors ? {...CAST[id], ...pose.colors} : CAST[id];
	const sil = pose.silhouette;
	const c = (col: string) => (sil ? sil : col);
	const seed = SEEDS[id];
	const w = L.width;

	const sit = !!pose.sit;
	const breathe = Math.sin(frame / 18 + seed) * 2;
	const trem = pose.tremble ? Math.sin(frame * 2.7 + seed) * pose.tremble : 0;
	const bob = (pose.bob ?? 0) + (sit ? 0 : 0);
	const hipY = (sit ? -62 : -95) + bob;
	const torsoTop = hipY - 98 + breathe * 0.3;
	const shoulderY = torsoTop + 16;
	const turn = pose.turn ?? 0;
	const back = !!pose.back;

	// legs
	const legDef: [number, number] = sit ? [-8, 4] : [0, 0];
	const [lA1, lA2] = pose.legL ?? (sit ? [-14, 6] : legDef);
	const [rA1, rA2] = pose.legR ?? (sit ? [14, -6] : legDef);
	const l1 = sit ? 28 : 48;
	const l2 = sit ? 52 : 50;
	const legL = limb(-19 * w, hipY, lA1, lA2, l1, l2);
	const legR = limb(19 * w, hipY, rA1, rA2, l1, l2);

	// arms
	const [aL1, aL2] = pose.armL ?? [-12, 4];
	const [aR1, aR2] = pose.armR ?? [12, -4];
	const armL = limb(-40 * w, shoulderY, aL1, aL2, 46, 42);
	const armR = limb(40 * w, shoulderY, aR1, aR2, 46, 42);

	const blinkAuto = (frame + seed * 3) % 101 < 4 ? 1 : 0;
	const blink = Math.max(pose.blink ?? 0, id === 'sixth' ? 0 : blinkAuto);
	const eyeOpen = (pose.eyeOpen ?? 1) * (1 - blink * 0.92);
	const headCY = torsoTop - 62;
	const fx = turn * 20;
	const lookX = (pose.lookX ?? 0) * 6;
	const lookY = (pose.lookY ?? 0) * 6;
	const mouth: Mouth = pose.mouth ?? 'smile';
	const brows: Brows = pose.brows ?? 'neutral';
	const ink = c('#2b1d1a');

	const armPath = (a: ReturnType<typeof limb>, sx: number) => `M ${sx} ${shoulderY} L ${a.ex} ${a.ey} L ${a.hx} ${a.hy}`;
	const legPath = (a: ReturnType<typeof limb>, sx: number) => `M ${sx} ${hipY} L ${a.ex} ${a.ey} L ${a.hx} ${a.hy}`;

	const itemHand = pose.itemHand ?? 'R';
	const ia = itemHand === 'R' ? armR : armL;
	const iAng = itemHand === 'R' ? aR1 + aR2 : aL1 + aL2;

	const drawArm = (a: ReturnType<typeof limb>, sx: number) => (
		<g>
			<path d={armPath(a, sx)} stroke={c(L.jacketDark)} strokeWidth={23} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d={armPath(a, sx)} stroke={c(L.jacket)} strokeWidth={17} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx={a.hx} cy={a.hy} r={11} fill={c(L.skin)} />
		</g>
	);

	const eye = (side: -1 | 1) => {
		const far = turn * side < 0 ? 1 - Math.abs(turn) * 0.25 : 1;
		const ex = side * 23 + fx;
		const ey = headCY - 6;
		const sixth = id === 'sixth' && !pose.humanEyes;
		return (
			<g key={side} transform={`translate(${ex} ${ey}) scale(${far} 1)`}>
				<ellipse cx={0} cy={0} rx={15} ry={18 * eyeOpen + 0.5} fill={sil ? 'none' : sixth ? '#f4f4ee' : '#ffffff'} />
				{eyeOpen > 0.2 && !sil && (
					<>
						<circle cx={lookX} cy={lookY} r={sixth ? 4.2 : 8.5} fill={sixth ? '#111' : '#1d1410'} />
						{!sixth && <circle cx={lookX + 3} cy={lookY - 3.5} r={2.6} fill="#fff" />}
					</>
				)}
			</g>
		);
	};

	const browY = headCY - 33 - (brows === 'raised' ? 6 : 0);
	const brow = (side: -1 | 1) => {
		const ex = side * 23 + fx;
		const tilt = brows === 'worried' ? -side * 14 : brows === 'angry' ? side * 16 : 0;
		return (
			<line
				key={'b' + side}
				x1={ex - 12}
				x2={ex + 12}
				y1={browY}
				y2={browY}
				stroke={ink}
				strokeWidth={5}
				strokeLinecap="round"
				transform={`rotate(${tilt} ${ex} ${browY})`}
			/>
		);
	};

	const mouthEl = () => {
		const mx = fx * 1.05;
		const my = headCY + 34;
		switch (mouth) {
			case 'grin':
				return <path d={`M ${mx - 20} ${my - 4} Q ${mx} ${my + 24} ${mx + 20} ${my - 4} Z`} fill={ink} />;
			case 'open':
				return <ellipse cx={mx} cy={my + 3} rx={9} ry={13} fill={ink} />;
			case 'o':
				return <ellipse cx={mx} cy={my + 2} rx={6} ry={7} fill={ink} />;
			case 'flat':
				return <line x1={mx - 12} x2={mx + 12} y1={my} y2={my} stroke={ink} strokeWidth={5} strokeLinecap="round" />;
			case 'worried':
				return <path d={`M ${mx - 14} ${my + 3} Q ${mx - 7} ${my - 3} ${mx} ${my + 3} Q ${mx + 7} ${my + 9} ${mx + 14} ${my + 3}`} stroke={ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
			case 'creepy':
				return (
					<g>
						<path d={`M ${mx - 32} ${my - 8} Q ${mx} ${my + 24} ${mx + 32} ${my - 8} Q ${mx} ${my + 8} ${mx - 32} ${my - 8} Z`} fill={c('#1a1414')} />
						{!sil && <path d={`M ${mx - 24} ${my - 2} Q ${mx} ${my + 9} ${mx + 24} ${my - 2}`} stroke="#e8e6dc" strokeWidth={3} fill="none" />}
					</g>
				);
			default:
				return <path d={`M ${mx - 16} ${my - 2} Q ${mx} ${my + 13} ${mx + 16} ${my - 2}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
		}
	};

	// ---- hair / headwear (behind head) ----
	const behindHead = () => {
		if (id === 'marta') {
			const sway = Math.sin(frame / 9 + seed) * 6;
			return <path d={`M ${-turn * 30 + 30} ${headCY - 40} q ${40 + sway} 30 ${20 + sway} 105 q -18 -25 -40 -95 z`} fill={c(L.hair)} />;
		}
		if (id === 'sara') return <path d={`M -70 ${headCY - 10} Q -74 ${headCY + 52} -44 ${headCY + 56} L 44 ${headCY + 56} Q 74 ${headCY + 52} 70 ${headCY - 10} Z`} fill={c(L.hair)} />;
		if (id === 'sixth') return <ellipse cx={0} cy={headCY + 4} rx={82} ry={84} fill={c(L.jacketDark)} />;
		return null;
	};

	const overHead = () => {
		switch (id) {
			case 'leo':
				return (
					<g>
						<path d={`M -66 ${headCY - 8} Q -64 ${headCY - 74} 0 ${headCY - 76} Q 64 ${headCY - 74} 66 ${headCY - 8} Z`} fill={c(L.accent)} />
						<rect x={-68} y={headCY - 22} width={136} height={20} rx={9} fill={c('#b02b2b')} />
						<circle cx={0} cy={headCY - 80} r={14} fill={c('#f3f0e8')} />
					</g>
				);
			case 'marta':
				return <path d={`M -66 ${headCY - 2} Q -70 ${headCY - 72} 0 ${headCY - 70} Q 70 ${headCY - 72} 66 ${headCY - 2} Q 40 ${headCY - 46} ${-10 + fx} ${headCY - 40} Q -40 ${headCY - 38} -66 ${headCY - 2} Z`} fill={c(L.hair)} />;
			case 'dani':
				return (
					<g fill={c(L.hair)}>
						{[-48, -24, 0, 24, 48].map((dx, i) => (
							<circle key={i} cx={dx} cy={headCY - 52 + Math.abs(dx) * 0.35} r={22} />
						))}
						<circle cx={-58} cy={headCY - 22} r={14} />
						<circle cx={58} cy={headCY - 22} r={14} />
					</g>
				);
			case 'sara':
				return <path d={`M -68 ${headCY + 6} Q -72 ${headCY - 70} 0 ${headCY - 70} Q 72 ${headCY - 70} 68 ${headCY + 6} L 56 ${headCY - 20} Q 20 ${headCY - 26} ${-6 + fx} ${headCY - 34} Q -30 ${headCY - 22} -56 ${headCY - 18} Z`} fill={c(L.hair)} />;
			case 'iker':
				return (
					<g>
						<path d={`M -64 ${headCY - 14} Q -62 ${headCY - 74} 0 ${headCY - 74} Q 62 ${headCY - 74} 64 ${headCY - 14} Z`} fill={c(L.accent)} />
						{!back && <path d={`M ${-30 + fx * 1.4} ${headCY - 22} Q ${fx * 1.4 + 20} ${headCY - 38} ${86 + fx * 1.6} ${headCY - 16} Q ${fx * 1.4 + 20} ${headCY - 6} ${-30 + fx * 1.4} ${headCY - 12} Z`} fill={c('#1f4fa8')} />}
					</g>
				);
			case 'sixth':
				return (
					<g>
						<path d={`M -80 ${headCY + 20} Q -84 ${headCY - 84} 0 ${headCY - 86} Q 84 ${headCY - 84} 80 ${headCY + 20} Q 60 ${headCY - 50} 0 ${headCY - 52} Q -60 ${headCY - 50} -80 ${headCY + 20} Z`} fill={c(L.jacket)} />
					</g>
				);
		}
		return null;
	};

	const torsoW = 86 * w;
	const torsoH = hipY - torsoTop + 12;

	return (
		<g transform={`translate(${x + trem} ${y}) scale(${flip ? -scale : scale} ${scale})`} opacity={opacity}>
			<defs>
				<radialGradient id={`hd${uid}`} cx="38%" cy="35%" r="75%">
					<stop offset="0%" stopColor={c(L.skin)} />
					<stop offset="70%" stopColor={c(L.skin)} />
					<stop offset="100%" stopColor={c(L.skinShade)} />
				</radialGradient>
			</defs>
			{/* legs */}
			<path d={legPath(legL, -19 * w)} stroke={c(L.pants)} strokeWidth={25} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d={legPath(legR, 19 * w)} stroke={c(L.pants)} strokeWidth={25} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<ellipse cx={legL.hx - 4} cy={legL.hy + 4} rx={19} ry={10} fill={c(L.shoes)} />
			<ellipse cx={legR.hx + 4} cy={legR.hy + 4} rx={19} ry={10} fill={c(L.shoes)} />

			<g transform={`rotate(${pose.lean ?? 0} 0 ${hipY})`}>
				{/* backpack */}
				{pose.backpack && (
					<g transform={`translate(${-turn * 46} 0)`}>
						<rect x={-44 * w} y={torsoTop + 4} width={88 * w} height={torsoH + 6} rx={22} fill={c(L.accent)} />
						<rect x={-30 * w} y={torsoTop - 14} width={60 * w} height={36} rx={14} fill={c('#5b4636')} />
					</g>
				)}
				{/* torso */}
				<rect x={-torsoW / 2} y={torsoTop} width={torsoW} height={torsoH} rx={26} fill={c(L.jacket)} />
				{!sil && (
					<>
						<rect x={torsoW / 2 - 24} y={torsoTop + 6} width={18} height={torsoH - 12} rx={9} fill={L.jacketDark} opacity={0.55} />
						{!back && <line x1={fx * 0.4} x2={fx * 0.4} y1={torsoTop + 18} y2={hipY + 4} stroke={L.jacketDark} strokeWidth={4} />}
						{!back && <path d={`M ${-24 + fx * 0.4} ${torsoTop + 2} L ${fx * 0.4} ${torsoTop + 20} L ${24 + fx * 0.4} ${torsoTop + 2}`} stroke={L.jacketDark} strokeWidth={6} fill="none" strokeLinecap="round" />}
						{id === 'sixth' && !back && (
							<path d={`M -26 ${torsoTop + 50} Q 0 ${torsoTop + 60} 26 ${torsoTop + 50}`} stroke={L.jacketDark} strokeWidth={5} fill="none" />
						)}
					</>
				)}

				{/* arms */}
				{drawArm(armL, -40 * w)}
				{drawArm(armR, 40 * w)}

				{/* items */}
				{pose.item === 'phone' && (
					<g transform={`translate(${ia.hx} ${ia.hy}) rotate(${-iAng * 0.3})`}>
						<rect x={-15} y={-34} width={30} height={52} rx={6} fill={c('#16161c')} />
						{!sil && <rect x={-12} y={-31} width={24} height={44} rx={4} fill="#9fd4ff" opacity={pose.phoneLit ?? 0.15} />}
					</g>
				)}
				{pose.item === 'flashlight' && (
					<g transform={`translate(${ia.hx} ${ia.hy}) rotate(${-iAng})`}>
						<rect x={-8} y={-6} width={16} height={46} rx={5} fill={c('#2b2f36')} />
						<rect x={-11} y={34} width={22} height={14} rx={4} fill={c('#4a515c')} />
						{!sil && <ellipse cx={0} cy={48} rx={9} ry={3} fill="#fff9d6" opacity={pose.phoneLit ?? 0} />}
					</g>
				)}

				{/* head */}
				<g transform={`rotate(${pose.headTilt ?? 0} 0 ${torsoTop + 4}) translate(0 ${breathe * 0.4})`}>
					{behindHead()}
					<circle cx={0} cy={headCY} r={64} fill={sil ? sil : `url(#hd${uid})`} />
					{back && !sil && <circle cx={0} cy={headCY} r={64} fill={L.hair} />}
					{!back && (
						<g>
							{id === 'sixth' && !sil && (
								<>
									<ellipse cx={fx} cy={headCY - 34} rx={64} ry={30} fill="#000" opacity={0.28} />
									<ellipse cx={-23 + fx} cy={headCY + 6} rx={16} ry={9} fill="#6a6a7a" opacity={0.35} />
									<ellipse cx={23 + fx} cy={headCY + 6} rx={16} ry={9} fill="#6a6a7a" opacity={0.35} />
								</>
							)}
							{!sil && (
								<>
									<ellipse cx={-36 + fx} cy={headCY + 20} rx={11} ry={7} fill="#ff7b7b" opacity={id === 'sixth' ? 0 : 0.35} />
									<ellipse cx={36 + fx} cy={headCY + 20} rx={11} ry={7} fill="#ff7b7b" opacity={id === 'sixth' ? 0 : 0.35} />
								</>
							)}
							{eye(-1)}
							{eye(1)}
							{!sil && brow(-1)}
							{!sil && brow(1)}
							{!sil && mouthEl()}
							{id === 'dani' && !sil && (
								<g stroke="#1c1c1c" strokeWidth={4.5} fill="none">
									<circle cx={-23 + fx} cy={headCY - 6} r={21} />
									<circle cx={23 + fx} cy={headCY - 6} r={21} />
									<line x1={-2 + fx} x2={2 + fx} y1={headCY - 8} y2={headCY - 8} />
								</g>
							)}
						</g>
					)}
					{overHead()}
					{(pose.glowEyes ?? 0) > 0 && (
						<g opacity={pose.glowEyes}>
							{[-1, 1].map((s) => (
								<g key={s}>
									<circle cx={s * 23 + fx} cy={headCY - 6} r={30} fill={`url(#eyeglow)`} />
									<ellipse cx={s * 23 + fx} cy={headCY - 6} rx={12} ry={14 * (pose.eyeOpen ?? 1)} fill="#f6fbff" />
									<circle cx={s * 23 + fx + lookX * 0.5} cy={headCY - 6} r={3.5} fill="#000" />
								</g>
							))}
						</g>
					)}
				</g>
			</g>
		</g>
	);
};

/** Shared defs (eye glow etc.). Put once per <svg>. */
export const SharedDefs: React.FC = () => (
	<defs>
		<radialGradient id="eyeglow">
			<stop offset="0%" stopColor="#dff3ff" stopOpacity={0.9} />
			<stop offset="45%" stopColor="#9fd6ff" stopOpacity={0.35} />
			<stop offset="100%" stopColor="#9fd6ff" stopOpacity={0} />
		</radialGradient>
		<filter id="softblur" x="-20%" y="-20%" width="140%" height="140%">
			<feGaussianBlur stdDeviation="6" />
		</filter>
		<filter id="blur2" x="-20%" y="-20%" width="140%" height="140%">
			<feGaussianBlur stdDeviation="2.5" />
		</filter>
	</defs>
);

/** Walk cycle helper (side-ish walk). */
export const walkPose = (frame: number, speed = 0.28, phase = 0, amp = 1): Pose => {
	const p = frame * speed + phase;
	const s = Math.sin(p);
	return {
		legL: [s * 26 * amp, Math.max(0, -Math.cos(p)) * 30 * amp],
		legR: [-s * 26 * amp, Math.max(0, Math.cos(p)) * 30 * amp],
		armL: [-s * 22 * amp - 6, 14],
		armR: [s * 22 * amp + 6, -14],
		bob: -Math.abs(Math.cos(p)) * 7 * amp,
	};
};
