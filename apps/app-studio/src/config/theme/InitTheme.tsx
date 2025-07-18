// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useContext} from 'react';
import {KitApp, KitModal} from 'aristid-ds';
import {LangContext} from '@leav/ui';

import 'antd/dist/reset.css';
import './reset.css';

KitModal.setAppElement(document.body);

export const InitTheme: FunctionComponent = ({children}) => {
    const {lang} = useContext(LangContext);

    // TODO: manage sidebar <EditRecordPage /> panel ref

    return (
        <KitApp
            locale={{
                // TODO: get lang from context
                locale: lang[0] === 'fr' ? 'frFR' : 'enUS',
                ItemList: null,
                Image: null
            }}
        >
            {children}
        </KitApp>
    );
};
