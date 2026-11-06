import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {TIMELINES} from './lib/timeline';
import {Episode} from './series/Episode';
import {EPISODES} from './series/registry';
import {CastSheet} from './lagonegro/CastSheet';
import {LAGO_NEGRO} from './lagonegro/registry';

const ALL_EPISODES = [...EPISODES, ...LAGO_NEGRO];
const EpisodeBySlug: React.FC<{slug: string; lang: 'es' | 'en'}> = ({slug, lang}) => <Episode ep={ALL_EPISODES.find((e) => e.slug === slug)!} lang={lang} />;

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="ElSexto-ES" component={Video} durationInFrames={TIMELINES.es.durationInFrames} fps={30} width={1080} height={1920} defaultProps={{lang: 'es' as const}} />
		<Composition id="TheSixthOne-EN" component={Video} durationInFrames={TIMELINES.en.durationInFrames} fps={30} width={1080} height={1920} defaultProps={{lang: 'en' as const}} />
		{EPISODES.map((ep) => (
			<Composition key={ep.slug} id={`ElSexto-${ep.slug.toUpperCase()}`} component={EpisodeBySlug} durationInFrames={ep.timelines.es!.durationInFrames} fps={30} width={1080} height={1920} defaultProps={{slug: ep.slug, lang: 'es' as const}} />
		))}
		{EPISODES.map((ep) => (
			<Composition key={ep.slug + '-en'} id={`TheSixthOne-${ep.slug.toUpperCase()}`} component={EpisodeBySlug} durationInFrames={ep.timelines.en!.durationInFrames} fps={30} width={1080} height={1920} defaultProps={{slug: ep.slug, lang: 'en' as const}} />
		))}
		{LAGO_NEGRO.map((ep) => (
			<Composition key={ep.slug} id={`LagoNegro-${ep.slug.replace('ln', 'CAP')}`} component={EpisodeBySlug} durationInFrames={ep.timelines.es!.durationInFrames} fps={30} width={1080} height={1920} defaultProps={{slug: ep.slug, lang: 'es' as const}} />
		))}
		<Composition id="LagoNegro-Cast" component={CastSheet} durationInFrames={30} fps={30} width={1080} height={1920} />
	</>
);
