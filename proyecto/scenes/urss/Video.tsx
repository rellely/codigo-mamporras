import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timingEs from './timing.json';
import timingEn from './timing.en.json';
import {urssScenes} from './index';

const TXT = {
  es: {hook: {text: 'la URSS no hubiera caído?', hl: 'URSS'}, question: '¿Más seguro o más peligroso?'},
  en: {hook: {text: 'the USSR had never fallen?', hl: 'USSR'}, question: 'Safer or more dangerous?'},
};

export const UrssVideo: React.FC<{lang?: 'es' | 'en'}> = ({lang = 'es'}) => (
  <Episode timing={(lang === 'en' ? timingEn : timingEs) as Timing} scenes={urssScenes} hook={TXT[lang].hook}
    question={TXT[lang].question} tint="#a03030" hypo={['s6_giro', 's7_china', 's8_mundo', 's9_final']} whatIf={['s6_giro']} />
);
