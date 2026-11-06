import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timing from './timing.json';
import {taiwanScenes} from './index';

export const TaiwanVideo: React.FC = () => (
  <Episode timing={timing as Timing} scenes={taiwanScenes} hook={{text: 'China invadiera Taiwán hoy?', hl: 'Taiwán'}}
    question="¿Crees que llegará a ocurrir?" tint="#2050a0" hypo={['s4_bloqueo', 's5_desembarco', 's6_fortaleza', 's7_simulacion', 's8_economia', 's9_final']} whatIf={['s4_bloqueo']} musicVol={0.28} />
);
