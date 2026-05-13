import {type FunctionComponent, useContext} from 'react';
import {KitApp, KitModal} from 'aristid-ds';
import {LangContext} from '@leav/ui';
import {library} from '@fortawesome/fontawesome-svg-core';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';

import 'antd/dist/reset.css';
import './reset.css';

KitModal.setAppElement(document.body);

export const InitTheme: FunctionComponent = ({children}) => {
    const {lang} = useContext(LangContext);

    // Add icons to the library so they can be used with string notation (for example in the WorkspacesNavigationMenu)
    library.add(fas, far);

    // TODO: manage sidebar <EditRecordPage /> panel ref

    return (
        <KitApp
            locale={{
                // TODO: get lang from context
                locale: lang[0] === 'fr' ? 'frFR' : 'enUS',
                ItemList: null,
                Image: null,
            }}
        >
            {children}
        </KitApp>
    );
};
