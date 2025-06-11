// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ReactNode, useState} from 'react';
import {ComponentProps, ReactNode, useRef, useState} from 'react';
import {ComponentProps, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {KitSidePanel} from 'aristid-ds';
import {SIDE_PANEL_CONTENT_ID} from '../../../constants';
import {EditRecordPage} from '@leav/ui';
import {IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';

export const useSidePanelForm = () => {
    const sidePanelPropsRef = useRef<ComponentProps<typeof KitSidePanel> | null>(null);
    const [keyToForceRerender, setKeyToForceRerender] = useState(0);

    const closeSidePanelForm = () => {
        if (sidePanelPropsRef.current && sidePanelPropsRef.current.onClose) {
            sidePanelPropsRef.current.onClose();
        }

        sidePanelPropsRef.current = null;
        setKeyToForceRerender(0);
    };

    const openSidePanelForm: IUseIFrameMessengerOptions['handlers']['onSidePanelForm'] = data => {
        sidePanelPropsRef.current = data;
        setKeyToForceRerender(prev => prev + 1);
    };

    return {
        openSidePanelForm,
        CustomSidePanelForm:
            keyToForceRerender === 0
                ? null
                : createPortal(
                      <KitSidePanel initialOpen floating closable size="m" onClose={closeSidePanelForm}>
                          <div style={{height: '100%'}}>
                              <EditRecordPage
                                  key={keyToForceRerender}
                                  record={null}
                                  library={null}
                                  {...sidePanelPropsRef.current}
                                  showRefreshButton={false}
                                  onClose={closeSidePanelForm}
                              />
                          </div>
                      </KitSidePanel>,
                      document.getElementById(SIDE_PANEL_CONTENT_ID)
                  )
    };
};
