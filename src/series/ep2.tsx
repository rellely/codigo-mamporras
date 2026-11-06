import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CampNight, SEATS} from '../components/CampNight';
import {Character} from '../components/Character';
import {DawnSet, DAWN_POS, FRIENDS, LINE_Y, DAWN_SCALE, shadowPoint} from '../components/DawnSet';
import {Tint} from '../components/env/Camp';
import {Flash, Glitch} from '../components/Overlays';
import {Bedroom, BED_HEAD} from '../components/sets/Bedroom';
import {TentsWorld, TrailWorld} from '../components/sets/Worlds';
import {Stage, talkMouth} from '../components/Stage';
import {EASE_OUT, kf} from '../lib/anim';
import {useCam} from '../lib/Camera';
import {useScene, useTr} from '../lib/timeline';
import type {EpisodeDef} from './Episode';
import {SeriesEnd} from './SeriesEnd';
import {Crop, PhonePhoto, photoPoint} from './shots';
import tlEs from '../generated/timeline_ep2_es.json';
import tlEn from '../generated/timeline_ep2_en.json';
import {Timeline} from '../lib/timeline';

const SPOT = {x: 540, y: 900, s: 1.18};
const TRAIL_CROP: Crop = {x: 0, y: 700, w: 1080, h: 1440};
const TENTS_CROP: Crop = {x: 60, y: 760, w: 960, h: 1280};
const FIRE_CROP: Crop = {x: 170, y: 760, w: 780, h: 1040};
const BED_CROP: Crop = {x: -80, y: 900, w: 780, h: 1040};
const SAD_FACE = {x: BED_HEAD.x - 10, y: BED_HEAD.y - 20};

const TRAIL_SIXTH = {x: 1010, y: 1470, s: 0.55};
const TENT_SIXTH = {x: 655, y: 1330, s: 0.78};

const firePhoto = (
	<g>
		<CampNight
			present={['leo', 'marta', 'dani', 'sara', 'iker']}
			darkness={0.25}
			fireflies={0}
			under={<Character id="sixth" x={SEATS.sara.x + 95} y={SEATS.sara.y - 30} scale={0.95} pose={{mouth: 'creepy', lookX: 0, armL: [-118, -30], blink: 0}} />}
			poses={{
				leo: {mouth: 'grin', lean: 6, armL: [-162, -10], lookX: 0.5, blink: 0},
				marta: {mouth: 'grin', lean: 9, headTilt: 8, lookX: 0.5, blink: 0},
				dani: {mouth: 'grin', lean: 6, lookX: 0.6, blink: 0},
				sara: {mouth: 'grin', armR: [162, -4], item: 'phone', phoneLit: 0.9, lookX: 0.6, lookY: -0.7, blink: 0},
				iker: {mouth: 'grin', lean: -8, headTilt: -8, lookX: -0.6, armR: [132, -40], blink: 0},
			}}
		/>
		<rect x={-2000} y={-2000} width={5000} height={5000} fill="#fff" opacity={0.12} />
	</g>
);

const bedPhoto = (
	<g>
		<Bedroom darkness={0.55} phoneGlow={0} saraPose={{blink: 1, mouth: 'flat'}} phoneOnStand />
		<Tint color="#7dff9a" opacity={0.35} />
	</g>
);

/* ---------------- scenes ---------------- */

const Recap: React.FC = () => {
	const frame = useCurrentFrame();
	const {lineStart, dur} = useScene();
	const s6 = shadowPoint(DAWN_POS.sixth, LINE_Y - 255 * DAWN_SCALE);
	const eyes = kf(frame, [[lineStart(1), 0], [lineStart(1) + 6, 1]]);
	const cam = useCam([
		{f: 0, x: 540, y: 1150, z: 1.0},
		{f: lineStart(1) - 4, x: 560, y: 980, z: 1.15},
		{f: lineStart(1) + 6, x: s6.x, y: s6.y + 60, z: 2.1, ease: EASE_OUT},
		{f: dur, x: s6.x, y: s6.y + 50, z: 2.3},
	], frame > lineStart(1) ? 5 : 2);
	const poses: any = {};
	FRIENDS.forEach((id, i) => (poses[id] = {mouth: 'grin', backpack: true, lookX: Math.sin(i), armR: [20, -10]}));
	return (
		<Stage cam={cam}>
			<DawnSet poses={poses} shadowOpacity={0.55} sixthShadow={{glowEyes: eyes, headTilt: -12 * eyes}} />
		</Stage>
	);
};

const BedroomScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {scene, f, lineStart, dur} = useScene();
	const smileW = scene.lines[1]?.words.find((w) => /sonrisa|smile/i.test(w.w));
	const flashAt = smileW ? f(smileW.start) : lineStart(1) + 30;
	const closed = frame >= lineStart(1) + 8 && frame < flashAt;
	const cam = useCam([
		{f: 0, x: 420, y: 1000, z: 1.05},
		{f: lineStart(1), x: 320, y: 1180, z: 1.8},
		{f: dur, x: 310, y: 1200, z: 2.2},
	], 2);
	const insert = frame >= flashAt && frame < flashAt + 7;
	return (
		<AbsoluteFill>
			<Stage cam={cam}>
				<Bedroom
					phoneGlow={1}
					saraPose={{
						blink: closed ? 1 : 0,
						mouth: frame > flashAt ? 'open' : 'flat',
						brows: frame > flashAt ? 'worried' : 'neutral',
						lookY: -0.6,
						lookX: frame > flashAt + 7 ? 0.8 : 0,
						}}
					holdPhone
				/>
			</Stage>
			{insert && (
				<AbsoluteFill style={{background: '#000'}}>
					<Stage cam={{x: 0, y: -240, z: 4.2, r: 0}} bg="#000">
						<Character id="sixth" x={0} y={0} scale={1} pose={{mouth: 'creepy', glowEyes: 0.6, blink: 0}} />
					</Stage>
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

const Gallery: React.FC = () => {
	const t = useTr();
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const cam = useCam([{f: 0, x: 540, y: 980, z: 1.0}, {f: dur, x: 540, y: 960, z: 1.06}], 2);
	return (
		<AbsoluteFill style={{background: '#05060c'}}>
			<Stage cam={cam} bg="transparent">
				<PhonePhoto spot={SPOT} photo={<TrailWorld />} crop={TRAIL_CROP} prev={{photo: <TentsWorld badges />, crop: TENTS_CROP}} swipeAt={cue('swipe1')} date={t('12 AGO', 'AUG 12')} index={t('1 de 4', '1 of 4')} time="02:58" />
			</Stage>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(120,170,255,0.12), transparent 60%)'}} />
			{void frame}
		</AbsoluteFill>
	);
};

/** Shared: zoom into a point of a phone photo at frame `at`. */
const usePhotoZoom = (target: {x: number; y: number}, at: number, z = 3.2) => {
	const {dur} = useScene();
	return useCam(
		[
			{f: 0, x: 540, y: 960, z: 1.0},
			{f: at - 3, x: 540, y: 950, z: 1.12},
			{f: at + 7, x: target.x, y: target.y + 20, z, ease: EASE_OUT},
			{f: dur, x: target.x, y: target.y + 20, z: z * 1.08},
		],
		2.5,
	);
};

const TrailPhoto: React.FC = () => {
	const t = useTr();
	const {cue} = useScene();
	const at = cue('glitch');
	const p = photoPoint(TRAIL_SIXTH.x, TRAIL_SIXTH.y - 230 * TRAIL_SIXTH.s, TRAIL_CROP, SPOT);
	const cam = usePhotoZoom(p, at, 3.6);
	return (
		<AbsoluteFill style={{background: '#05060c'}}>
			<Glitch at={at} len={10}>
				<Stage cam={cam} bg="transparent">
					<PhonePhoto spot={SPOT} photo={<TrailWorld sixth={TRAIL_SIXTH} />} crop={TRAIL_CROP} date={t('12 AGO', 'AUG 12')} index={t('2 de 4', '2 of 4')} time="02:59" />
				</Stage>
			</Glitch>
		</AbsoluteFill>
	);
};

const TentPhoto: React.FC = () => {
	const t = useTr();
	const {cue} = useScene();
	const at = cue('sting');
	const p = photoPoint(TENT_SIXTH.x, TENT_SIXTH.y - 230 * TENT_SIXTH.s, TENTS_CROP, SPOT);
	const cam = usePhotoZoom(p, at, 3.4);
	return (
		<AbsoluteFill style={{background: '#05060c'}}>
			<Glitch at={at} len={8}>
				<Stage cam={cam} bg="transparent">
					<PhonePhoto
						spot={SPOT}
						photo={<TentsWorld sixth={TENT_SIXTH} />}
						crop={TENTS_CROP}
						prev={{photo: <TrailWorld sixth={TRAIL_SIXTH} />, crop: TRAIL_CROP}}
						swipeAt={cue('swipe')}
						date={t('12 AGO', 'AUG 12')}
						index={t('3 de 4', '3 of 4')}
						time="03:00"
					/>
				</Stage>
			</Glitch>
		</AbsoluteFill>
	);
};

const FirePhoto: React.FC = () => {
	const t = useTr();
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const at = cue('sting');
	const p = photoPoint(SEATS.sara.x + 40, SEATS.sara.y - 170, FIRE_CROP, SPOT);
	const cam = usePhotoZoom(p, at, 2.6);
	const react = frame > dur - 30;
	return (
		<AbsoluteFill style={{background: '#05060c'}}>
			<Glitch at={at} len={8}>
				<Stage cam={cam} bg="transparent">
					<PhonePhoto spot={SPOT} photo={firePhoto} crop={FIRE_CROP} prev={{photo: <TentsWorld sixth={TENT_SIXTH} />, crop: TENTS_CROP}} swipeAt={cue('swipe')} date={t('12 AGO', 'AUG 12')} index={t('4 de 4', '4 of 4')} time="03:01" />
				</Stage>
			</Glitch>
			{react && (
				<Stage cam={{x: SAD_FACE.x + 30, y: SAD_FACE.y + 40, z: 2.4, r: 0}}>
					<Bedroom holdPhone saraPose={{mouth: 'open', brows: 'worried', lookY: -0.6, tremble: 2}} />
				</Stage>
			)}
		</AbsoluteFill>
	);
};

const LastPhoto: React.FC = () => {
	const t = useTr();
	const {cue, dur} = useScene();
	const boom = cue('boom');
	const p = photoPoint(BED_HEAD.x, BED_HEAD.y, BED_CROP, SPOT);
	const cam = useCam(
		[
			{f: 0, x: 540, y: 960, z: 1.0},
			{f: cue('glitch'), x: 540, y: 950, z: 1.15},
			{f: boom - 2, x: 540, y: 940, z: 1.25},
			{f: boom + 6, x: p.x, y: p.y, z: 3.0, ease: EASE_OUT},
			{f: dur, x: p.x, y: p.y, z: 3.2},
		],
		3,
	);
	return (
		<AbsoluteFill style={{background: '#05060c'}}>
			<Glitch at={cue('glitch')} len={10}>
				<Stage cam={cam} bg="transparent">
					<PhonePhoto spot={SPOT} photo={bedPhoto} crop={BED_CROP} prev={{photo: firePhoto, crop: FIRE_CROP}} swipeAt={cue('swipe')} date={t('HOY · 03:12', 'TODAY · 03:12')} index={t('5 de 5', '5 of 5')} time="03:12" />
				</Stage>
			</Glitch>
			<Flash at={boom} len={8} color="#ff2d3a" peak={0.3} />
		</AbsoluteFill>
	);
};

const Corner: React.FC = () => {
	const frame = useCurrentFrame();
	const {dur, lineStart, lineEnd} = useScene();
	const cam = useCam([
		{f: 0, x: 360, y: 1120, z: 1.6},
		{f: lineStart(1) - 10, x: 760, y: 1050, z: 1.35},
		{f: dur, x: 960, y: 1060, z: 1.9},
	], 2.5);
	return (
		<Stage cam={cam}>
			<Bedroom
				saraSitting={kf(frame, [[0, 0], [20, 1]])}
				wardrobeAjar={kf(frame, [[0, 0.15], [dur, 0.32]])}
				holdPhone
				saraPose={{mouth: talkMouth(frame, lineStart(1), lineEnd(1), 'worried'), brows: 'worried', lookX: 1, tremble: 1.5}}
				darkness={0.88}
			/>
		</Stage>
	);
};

const FlashScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {cue, dur} = useScene();
	const shot = cue('shutter');
	const after = frame >= shot;
	const cam = useCam(after ? [{f: 0, x: 620, y: 1000, z: 0.95}] : [{f: 0, x: 330, y: 1100, z: 2.0}, {f: shot, x: 330, y: 1100, z: 2.5}], after ? 6 : 2);
	const visible = frame >= shot && frame < shot + 12;
	return (
		<AbsoluteFill>
			<Stage cam={cam}>
				<Bedroom
					saraSitting={1}
					wardrobeAjar={0.32}
					darkness={after ? (visible ? 0.1 : 0.995) : 0.9}
					phoneGlow={after ? 0 : 0.8}
					sixthInCorner={visible ? 1 : 0}
					holdPhone
					saraPose={{mouth: after ? 'open' : 'flat', brows: 'worried', lookX: after ? 1 : 0.4, lookY: -0.3, tremble: 2}}
				/>
			</Stage>
			<Flash at={shot} len={10} />
			{frame > shot + 12 && <AbsoluteFill style={{background: '#000', opacity: kf(frame, [[shot + 12, 0.6], [dur, 1]])}} />}
		</AbsoluteFill>
	);
};

const End: React.FC<{title: string; part: string; next?: string}> = (p) => <SeriesEnd title={p.title} part={p.part} next={p.next} />;

export const EP2: EpisodeDef = {
	slug: 'ep2',
	timelines: {es: tlEs as unknown as Timeline, en: tlEn as unknown as Timeline},
	next: {es: 'Sigue en la PARTE 3', en: 'Continues in PART 3'},
	scenes: {
		recap: {C: Recap, vignette: 0.7},
		bedroom: {C: BedroomScene, fadeIn: 10, vignette: 0.8},
		gallery: {C: Gallery, vignette: 0.7},
		trailphoto: {C: TrailPhoto, vignette: 0.7},
		tentphoto: {C: TentPhoto, vignette: 0.7},
		firephoto: {C: FirePhoto, vignette: 0.7},
		lastphoto: {C: LastPhoto, vignette: 0.75},
		corner: {C: Corner, fadeIn: 6, vignette: 0.85},
		flash: {C: FlashScene, vignette: 0.85},
		end: {C: End, fadeIn: 6, fadeOut: 12},
	},
};
