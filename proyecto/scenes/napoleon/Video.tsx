import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timingEs from './timing.json';
import timingEn from './timing.en.json';
import {napoleonScenes} from './index';

const TXT = {
  es: {hook: {text: 'Napoleón hubiera ganado?', hl: 'Napoleón'}, question: '¿Libertador o tirano?'},
  en: {hook: {text: 'Napoleon had won?', hl: 'Napoleon'}, question: 'Liberator or tyrant?'},
};

export const NapoleonVideo: React.FC<{lang?: 'es' | 'en'}> = ({lang = 'es'}) => (
  <Episode timing={(lang === 'en' ? timingEn : timingEs) as Timing} scenes={napoleonScenes} hook={TXT[lang].hook}
    question={TXT[lang].question} tint="#3050a0" hypo={['s6_giro', 's8_imperio']} whatIf={['s6_giro']} />
);
