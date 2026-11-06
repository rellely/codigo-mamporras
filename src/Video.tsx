import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile} from 'remotion';
import {Fade, Grain} from './components/Overlays';
import {Vignette} from './components/env/Camp';
import {Subtitles} from './components/Subtitles';
import {Lang, SceneProvider, sceneFrames, TIMELINES} from './lib/timeline';
import {S01Hook} from './scenes/S01Hook';
import {S02Trail} from './scenes/S02Trail';
import {S03Tents} from './scenes/S03Tents';
import {S04Photo} from './scenes/S04Photo';
import {S05Phone} from './scenes/S05Phone';
import {S06Count} from './scenes/S06Count';
import {S07Talk} from './scenes/S07Talk';
import {S08Shadow} from './scenes/S08Shadow';
import {S09Blackout} from './scenes/S09Blackout';
import {S10Dawn} from './scenes/S10Dawn';
import {S11Twist} from './scenes/S11Twist';
import {S12End} from './scenes/S12End';

/** Scene registry: id -> component + transition settings (frames). */
const SCENES: Record<string, {C: React.FC<any>; fadeIn?: number; fadeOut?: number; vignette?: number}> = {
	hook: {C: S01Hook, fadeOut: 6, vignette: 0.8},
	trail: {C: S02Trail, fadeIn: 8, vignette: 0.45},
	tents: {C: S03Tents, fadeIn: 6, fadeOut: 8, vignette: 0.55},
	photo: {C: S04Photo, fadeIn: 10, vignette: 0.75},
	phone: {C: S05Phone, vignette: 0.7},
	count: {C: S06Count, fadeIn: 4, vignette: 0.75},
	talk: {C: S07Talk, vignette: 0.8},
	shadow: {C: S08Shadow, vignette: 0.8},
	blackout: {C: S09Blackout, vignette: 0.85},
	dawn: {C: S10Dawn, fadeIn: 18, vignette: 0.4},
	twist: {C: S11Twist, fadeOut: 10, vignette: 0.6},
	end: {C: S12End, fadeIn: 4, fadeOut: 12, vignette: 0.6},
};

const useFont = () => {
	const [handle] = useState(() => delayRender('font'));
	useEffect(() => {
		const font = new FontFace('InterBlack', `url(${staticFile('fonts/Inter-Black.otf')}) format('opentype')`, {weight: '900'});
		font
			.load()
			.then((f) => {
				document.fonts.add(f);
				continueRender(handle);
			})
			.catch(() => continueRender(handle));
	}, [handle]);
};

export const Video: React.FC<{lang: Lang}> = ({lang}) => {
	useFont();
	const tl = TIMELINES[lang];
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Audio src={staticFile(`audio/mix_${lang}.wav`)} />
			{tl.scenes.map((s) => {
				const def = SCENES[s.id];
				if (!def) return null;
				const {from, duration} = sceneFrames(s);
				return (
					<Sequence key={s.id} from={from} durationInFrames={duration} name={s.id}>
						<SceneProvider value={{scene: s, lang}}>
							<def.C title={tl.title} />
							<Vignette strength={def.vignette ?? 0.6} />
							<Fade dur={duration} inF={def.fadeIn} outF={def.fadeOut} />
						</SceneProvider>
					</Sequence>
				);
			})}
			<Grain opacity={0.1} />
			<Subtitles tl={tl} />
		</AbsoluteFill>
	);
};
