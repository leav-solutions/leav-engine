// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ReactNode, useState} from 'react';
import {createPortal} from 'react-dom';
import {KitSidePanel} from 'aristid-ds';
import {SIDE_PANEL_CONTENT_ID} from '../../../constants';
import {EditRecordPage} from '@leav/ui';
import {IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';

export const useSidePanelForm = () => {
    const [sidePanelContent, setSidePanelContent] = useState<ReactNode | null>(null);

    const closeSidePanelForm = () => setSidePanelContent(null);
    const openSidePanelForm: IUseIFrameMessengerOptions['handlers']['onSidePanelForm'] = data => {
        setSidePanelContent(
            <EditRecordPage
                {...data}
                showRefreshButton={false}
                onClose={() => {
                    closeSidePanelForm();

                    console.log('data', data);

                    //TODO: onClose pas dans data ??? Il faudrait que le onClose soit jouer dans closeSidePanelForm pour être iso entre les deux boutons
                    // (même si un des deux va partir)
                    data.onClose();
                }}
            />
        );
    };

    return {
        openSidePanelForm,
        CustomSidePanelForm:
            sidePanelContent === null
                ? null
                : createPortal(
                      <KitSidePanel initialOpen floating closable size="m" onClose={closeSidePanelForm}>
                          <div style={{height: '100%'}}>{sidePanelContent}</div>
                      </KitSidePanel>,
                      document.getElementById(SIDE_PANEL_CONTENT_ID)
                  )
    };
};
