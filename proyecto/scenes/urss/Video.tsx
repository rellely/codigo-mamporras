import React from 'react';
import {Episode, Timing} from '../../components/Episode';
import timing from './timing.json';
import {urssScenes} from './index';

export const UrssVideo: React.FC = () => (
  <Episode timing={timing as Timing} scenes={urssScenes} hook={{text: 'la URSS no hubiera caído?', hl: 'URSS'}}
    question="¿Más seguro o más peligroso?" tint="#a03030" hypo={['s6_giro', 's7_china', 's8_mundo', 's9_final']} whatIf={['s6_giro']} />
);
