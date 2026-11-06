import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timingEs from './timing.json';
import timingEn from './timing.en.json';
import {ww2Scenes} from './index';

const TXT = {
  es: {hook: {text: 'nunca hubiera existido la Segunda Guerra Mundial?', hl: 'Segunda Guerra Mundial'}, question: '¿Tú qué crees que habría pasado?'},
  en: {hook: {text: 'World War II had never happened?', hl: 'World War II'}, question: 'What do you think would have happened?'},
};

export const Ww2Video: React.FC<{lang?: 'es' | 'en'}> = ({lang = 'es'}) => (
  <Episode timing={(lang === 'en' ? timingEn : timingEs) as Timing} scenes={ww2Scenes} hook={TXT[lang].hook}
    question={TXT[lang].question} tint="#806040" hypo={['s4_munich', 's5_holocausto', 's6_tecnologia', 's7_imperios', 's8_guerrafria', 's9_final']} whatIf={['s4_munich']} musicVol={0.3} />
);
