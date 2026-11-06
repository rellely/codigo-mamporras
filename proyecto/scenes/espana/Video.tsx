import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timingEs from './timing.json';
import timingEn from './timing.en.json';
import {espanaScenes} from './index';

const TXT = {
  es: {hook: {text: 'España nunca hubiera perdido América?', hl: 'América'}, question: '¿Superpotencia o ruptura?'},
  en: {hook: {text: 'Spain had never lost America?', hl: 'America'}, question: 'Superpower or breakup?'},
};

export const EspanaVideo: React.FC<{lang?: 'es' | 'en'}> = ({lang = 'es'}) => (
  <Episode timing={(lang === 'en' ? timingEn : timingEs) as Timing} scenes={espanaScenes} hook={TXT[lang].hook}
    question={TXT[lang].question} tint="#b07020" hypo={['s7_giro', 's8_bloque', 's9_final']} whatIf={['s7_giro']} />
);
