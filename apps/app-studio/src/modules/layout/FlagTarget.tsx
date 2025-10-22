// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {FLAP_TARGET_ID} from '../../constants';

import {flapTarget} from './layout.module.css';

export const FlagTarget: FunctionComponent = () => <div id={FLAP_TARGET_ID} className={flapTarget} />;
