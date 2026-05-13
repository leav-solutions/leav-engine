import {type FunctionComponent} from 'react';
import {ACTIVITY_CENTER_TARGET_ID} from '../../constants';

import {activityCenterTarget} from './layout.module.css';

export const ActivityCenterTarget: FunctionComponent = () => (
    <div id={ACTIVITY_CENTER_TARGET_ID} className={activityCenterTarget} />
);
