import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timingEs from './timing.json';
import timingEn from './timing.en.json';
import {taiwanScenes} from './index';

const TXT = {
  es: {hook: {text: 'China invadiera Taiwán hoy?', hl: 'Taiwán'}, question: '¿Crees que llegará a ocurrir?'},
  en: {hook: {text: 'China invaded Taiwan today?', hl: 'Taiwan'}, question: 'Do you think it will happen?'},
};

export const TaiwanVideo: React.FC<{lang?: 'es' | 'en'}> = ({lang = 'es'}) => (
  <Episode timing={(lang === 'en' ? timingEn : timingEs) as Timing} scenes={taiwanScenes} hook={TXT[lang].hook}
    question={TXT[lang].question} tint="#2050a0" hypo={['s4_bloqueo', 's5_desembarco', 's6_fortaleza', 's7_simulacion', 's8_economia', 's9_final']} whatIf={['s4_bloqueo']} musicVol={0.28} />
);
