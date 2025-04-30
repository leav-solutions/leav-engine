// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {KitApp, KitModal} from 'aristid-ds';

import 'antd/dist/reset.css';
import './reset.css';

export const InitTheme: FunctionComponent = ({children}) => (
    // TODO: make it work
    // KitModal.setAppElement(document.getElementsByTagName('body')[0]);

    // TODO: manage <Explorer /> panel ref
    // TODO: manage sidebar <EditRecordPage /> panel ref

    <KitApp
        locale={{
            // TODO: get lang from context
            locale: 'frFR',
            ItemList: null,
            Image: null
        }}
    >
        {children}
    </KitApp>
);
