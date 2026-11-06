import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timing from './timing.json';
import {ww2Scenes} from './index';

export const Ww2Video: React.FC = () => (
  <Episode timing={timing as Timing} scenes={ww2Scenes} hook={{text: 'nunca hubiera existido la Segunda Guerra Mundial?', hl: 'Segunda Guerra Mundial'}}
    question="¿Tú qué crees que habría pasado?" tint="#806040" hypo={['s4_munich', 's5_holocausto', 's6_tecnologia', 's7_imperios', 's8_guerrafria', 's9_final']} whatIf={['s4_munich']} musicVol={0.3} />
);
