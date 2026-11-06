import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {TIMELINES} from './lib/timeline';
import {Episode} from './series/Episode';
import {EPISODES} from './series/registry';

const EpisodeBySlug: React.FC<{slug: string}> = ({slug}) => <Episode ep={EPISODES.find((e) => e.slug === slug)!} />;

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="ElSexto-ES" component={Video} durationInFrames={TIMELINES.es.durationInFrames} fps={30} width={1080} height={1920} defaultProps={{lang: 'es' as const}} />
		<Composition id="TheSixthOne-EN" component={Video} durationInFrames={TIMELINES.en.durationInFrames} fps={30} width={1080} height={1920} defaultProps={{lang: 'en' as const}} />
		{EPISODES.map((ep) => (
			<Composition key={ep.slug} id={`ElSexto-${ep.slug.toUpperCase()}`} component={EpisodeBySlug} durationInFrames={ep.timeline.durationInFrames} fps={30} width={1080} height={1920} defaultProps={{slug: ep.slug}} />
		))}
	</>
);
