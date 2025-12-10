// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {ACTIVITY_CENTER_TARGET_ID} from '../../constants';

import {activityCenterTarget} from './layout.module.css';

export const ActivityCenterTarget: FunctionComponent = () => (
    <div id={ACTIVITY_CENTER_TARGET_ID} className={activityCenterTarget} />
);
