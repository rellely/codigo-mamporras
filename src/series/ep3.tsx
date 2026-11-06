import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Character, CharId, Pose} from '../components/Character';
import {Smoke} from '../components/env/Camp';
import {Flash, Glitch} from '../components/Overlays';
import {Laptop} from '../components/sets/Newspaper';
import {ChatScreen, GalleryScreen, Phone} from '../components/sets/PhoneUI';
import {Garage, GARAGE_WINDOW} from '../components/sets/Worlds';
import {Stage, talkMouth} from '../components/Stage';
import {EASE_OUT, kf} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {Timeline, useScene, useTr} from '../lib/timeline';
import type {EpisodeDef} from './Episode';
import {SeriesEnd} from './SeriesEnd';
import tlEs from '../generated/timeline_ep3_es.json';
import tlEn from '../generated/timeline_ep3_en.json';

const GY = 1470;
const POS: Record<string, number> = {leo: 170, marta: 340, dani: 540, sara: 740, iker: 910};
const FR: Exclude<CharId, 'sixth'>[] = ['leo', 'marta', 'dani', 'sara', 'iker'];

/** The five friends gathered in the garage. */
const Gang: React.FC<{poses?: Partial<Record<CharId, Pose>>}> = ({poses = {}}) => (
	<g>
		{FR.map((id) => (
			<Character key={id} id={id} x={POS[id]} y={GY + (id === 'dani' ? 20 : 0)} scale={0.95} pose={{mouth: 'worried', brows: 'worried', ...(poses[id] ?? {})}} />
		))}
	</g>
);

const LaptopOnBench: React.FC<{zoom?: number}> = ({zoom = 0}) => <Laptop x={540} y={1180} s={0.2} photoZoom={zoom} />;

const Hook: React.FC = () => {
	const t = useTr();
	const frame = useCurrentFrame();
	const {dur} = useScene();
	const cam = useCam([{f: 0, x: 540, y: 1000, z: 0.95}, {f: dur, x: 540, y: 1250, z: 1.35}], 2);
	return (
		<AbsoluteFill style={{background: '#04050a'}}>
			<Stage cam={cam} bg="transparent">
				<Phone x={540} y={980} s={1.15} hand="leo">
					<ChatScreen title={t('ACAMPADA', 'CAMPING TRIP')} msgs={[{from: 'system', text: t('? se ha unido al grupo', '? joined the group'), at: 8}]} />
				</Phone>
			</Stage>
			{void frame}
		</AbsoluteFill>
	);
};

const Chat: React.FC = () => {
	const t = useTr();
	const {cue, lineStart, dur} = useScene();
	const m3 = cue('m3');
	const cam = useCam([
		{f: 0, x: 540, y: 1080, z: 1.15},
		{f: m3 - 4, x: 540, y: 1180, z: 1.3},
		{f: m3 + 6, x: 420, y: 1260, z: 2.2, ease: EASE_OUT},
		{f: dur, x: 420, y: 1260, z: 2.35},
	], 2);
	return (
		<AbsoluteFill style={{background: '#04050a'}}>
			<Glitch at={m3} len={8}>
				<Stage cam={cam} bg="transparent">
					<Phone x={540} y={980} s={1.15} hand="leo">
						<ChatScreen
							title={t('ACAMPADA', 'CAMPING TRIP')}
							msgs={[
								{from: 'system', text: t('? se ha unido al grupo', '? joined the group'), at: -100},
								{from: 'leo', text: t('¿Quién ha metido a ese?', 'Who added this guy?'), at: cue('m1')},
								{from: 'marta', text: t('Yo no', 'Not me'), at: cue('m2')},
								{from: 'dani', text: t('Ni yo', 'Me neither'), at: cue('m2') + 14},
								{from: 'sixth', text: t('¿Cuándo volvemos?', 'When are we going back?'), at: m3},
							]}
							typing={{from: 'sixth', at: lineStart(1), until: m3}}
						/>
					</Phone>
				</Stage>
			</Glitch>
		</AbsoluteFill>
	);
};

const GarageScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const cam = useCam([{f: 0, x: 380, y: 1150, z: 1.15}, {f: lineStart(1), x: 520, y: 1100, z: 1.05}, {f: dur, x: 300, y: 1150, z: 1.45}], 2);
	return (
		<Stage cam={cam}>
			<Garage
				under={
					<Gang
						poses={{
							leo: {armL: [-40, 100], armR: [40, -100], mouth: talkMouth(frame, lineStart(1), lineEnd(1), 'flat'), brows: 'angry', lookX: 0.6},
							dani: {mouth: 'flat', brows: 'neutral', lookY: 0.8, armL: [-30, -30], armR: [30, 30]},
							marta: {lookX: 0.8},
							sara: {lookX: -0.8, armR: [30, -40]},
							iker: {lookX: -1},
						}}
					/>
				}
				over={<LaptopOnBench />}
			/>
		</Stage>
	);
};

const News: React.FC = () => {
	const {dur, scene, f} = useScene();
	const five = scene.cues['sting'] ? f(scene.cues['sting']) : dur - 30;
	const cam = useCam([
		{f: 0, x: 540, y: 1000, z: 1.0},
		{f: five - 20, x: 540, y: 1000, z: 1.1},
		{f: five + 6, x: 450, y: 1030, z: 1.55, ease: EASE_OUT},
		{f: dur, x: 450, y: 1030, z: 1.62},
	], 2);
	return (
		<AbsoluteFill style={{background: '#1a1714'}}>
			<Stage cam={cam} bg="transparent">
				<rect x={-500} y={1300} width={2100} height={900} fill="#7a5638" />
				<Laptop x={540} y={1000} s={1.05} />
			</Stage>
		</AbsoluteFill>
	);
};

const HugoPhoto: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const at = cue('glitch');
	const zoom = kf(frame, [[at - 4, 0], [at + 10, 1]]);
	const cam = useCam([{f: 0, x: 450, y: 1030, z: 1.62}, {f: dur, x: 380, y: 1040, z: 1.9}], 2);
	return (
		<AbsoluteFill style={{background: '#1a1714'}}>
			<Glitch at={at} len={10}>
				<Stage cam={cam} bg="transparent">
					<rect x={-500} y={1300} width={2100} height={900} fill="#7a5638" />
					<Laptop x={540} y={1000} s={1.05} photoZoom={zoom} />
				</Stage>
			</Glitch>
			<Flash at={cue('boom')} len={8} color="#fff" peak={0.35} />
		</AbsoluteFill>
	);
};

const Discuss: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const cam = useCam([{f: 0, x: 540, y: 1180, z: 1.5}, {f: lineStart(1) - 6, x: 500, y: 1170, z: 1.5}, {f: lineStart(1) + 6, x: 340, y: 1180, z: 1.9}, {f: dur, x: 340, y: 1180, z: 2.0}], 2);
	return (
		<Stage cam={cam}>
			<Garage
				under={
					<Gang
						poses={{
							dani: {mouth: talkMouth(frame, lineStart(0), lineEnd(0), 'flat'), brows: 'worried', lookX: -0.4, armR: [90 + Math.sin(frame / 6) * 15, -30]},
							marta: {mouth: talkMouth(frame, lineStart(1), lineEnd(1), 'worried'), brows: 'worried', lookX: 0.6},
							leo: {lookX: 1},
							sara: {lookX: -1},
							iker: {lookX: -1, mouth: 'flat'},
						}}
					/>
				}
				over={<LaptopOnBench zoom={1} />}
			/>
		</Stage>
	);
};

/** Photo from outside: the garage window seen from the street. */
const OutsidePhoto: React.FC = () => {
	const W = GARAGE_WINDOW;
	return (
		<g>
			<rect width={600} height={800} fill="#0b0d16" />
			{new Array(12).fill(0).map((_, r) => (
				<line key={r} x1={0} x2={600} y1={r * 70} y2={r * 70} stroke="#151826" strokeWidth={4} />
			))}
			<svg x={90} y={170} width={420} height={420} viewBox="120 900 840 840">
				<Garage under={<Gang />} over={<LaptopOnBench />} darkness={0.3} bulbSwing={0} />
			</svg>
			<rect x={90} y={170} width={420} height={420} fill="#c8d4e8" opacity={0.1} />
			<rect x={90} y={170} width={420} height={420} fill="none" stroke="#2e3036" strokeWidth={20} />
			<line x1={300} x2={300} y1={170} y2={590} stroke="#2e3036" strokeWidth={12} />
			<rect width={600} height={800} fill="#1a2a5a" opacity={0.15} />
			{void W}
		</g>
	);
};

const NewPhoto: React.FC = () => {
	const t = useTr();
	const {cue, dur} = useScene();
	const boom = cue('boom');
	const cam = useCam([{f: 0, x: 540, y: 960, z: 1.0}, {f: boom - 2, x: 540, y: 940, z: 1.12}, {f: boom + 6, x: 540, y: 880, z: 1.8, ease: EASE_OUT}, {f: dur, x: 540, y: 880, z: 1.9}], 3);
	return (
		<AbsoluteFill style={{background: '#04050a'}}>
			<Glitch at={boom} len={10}>
				<Stage cam={cam} bg="transparent">
					<Phone x={540} y={900} s={1.18} hand="leo">
						<GalleryScreen photo={<OutsidePhoto />} date={t('? te ha enviado una foto', '? sent you a photo')} index={t('hace 1 segundo', '1 second ago')} time="19:06" />
					</Phone>
				</Stage>
			</Glitch>
		</AbsoluteFill>
	);
};

const Window: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, lineEnd, dur} = useScene();
	const W = GARAGE_WINDOW;
	const fig = kf(frame, [[6, 0], [14, 1], [lineEnd(0) + 4, 1], [lineEnd(0) + 8, 0]]);
	const cam = useCam([
		{f: 0, x: 540, y: 1100, z: 1.0},
		{f: 12, x: W.x + W.w / 2, y: W.y + W.h / 2 + 80, z: 2.2},
		{f: lineEnd(0) + 8, x: W.x + W.w / 2, y: W.y + W.h / 2 + 60, z: 2.5},
		{f: lineStart(1) + 10, x: 600, y: 1050, z: 1.1},
		{f: dur, x: 600, y: 1050, z: 1.15},
	], frame < lineEnd(0) ? 5 : 2);
	const look: Pose = {lookX: 1, lookY: -0.6, mouth: 'open', brows: 'worried', tremble: 1.2};
	const later = frame > lineStart(1);
	return (
		<Stage cam={cam}>
			<Garage
				windowFigure={fig}
				bulbSwing={2}
				under={<Gang poses={{leo: later ? {lookX: 1, mouth: 'flat'} : look, marta: look, dani: look, sara: look, iker: look}} />}
				over={
					<g>
						<LaptopOnBench zoom={1} />
						{later && <Smoke x={W.x + 60} y={W.y + W.h} amount={0.6} wind={0.4} />}
					</g>
				}
			/>
		</Stage>
	);
};

const End: React.FC<{title: string; part: string; next?: string}> = (p) => <SeriesEnd title={p.title} part={p.part} next={p.next} />;

export const EP3: EpisodeDef = {
	slug: 'ep3',
	timelines: {es: tlEs as unknown as Timeline, en: tlEn as unknown as Timeline},
	next: {es: 'Sigue en la PARTE 4', en: 'Continues in PART 4'},
	scenes: {
		hook: {C: Hook, vignette: 0.7},
		chat: {C: Chat, vignette: 0.7},
		garage: {C: GarageScene, fadeIn: 8, vignette: 0.6},
		news: {C: News, vignette: 0.65},
		hugo: {C: HugoPhoto, vignette: 0.7},
		discuss: {C: Discuss, vignette: 0.65},
		newphoto: {C: NewPhoto, vignette: 0.7},
		window: {C: Window, vignette: 0.75},
		end: {C: End, fadeIn: 6, fadeOut: 12},
	},
};
