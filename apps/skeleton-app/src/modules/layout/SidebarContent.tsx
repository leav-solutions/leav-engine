// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {SIDEBAR_CONTENT_ID} from '../../constants';

import {sidebarContent} from './layout.module.css';

export const SidebarContent: FunctionComponent = ({children}) => (
    <div id={SIDEBAR_CONTENT_ID} className={sidebarContent}>
        {children}
    </div>
);
