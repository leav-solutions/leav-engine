// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {SIDE_PANEL_TARGET_ID} from '../../constants';

import {sidePanelTarget} from './layout.module.css';

export const SidePanelTarget: FunctionComponent = () => <div id={SIDE_PANEL_TARGET_ID} className={sidePanelTarget} />;
