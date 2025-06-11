// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {KitSidePanel} from 'aristid-ds';
import {SIDE_PANEL_CONTENT_ID} from '../../../constants';
import {EditRecordPage} from '@leav/ui';
import {IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';

const NO_RENDER_KEY = 0;

export const useSidePanelForm = () => {
    const sidePanelPropsRef = useRef<ComponentProps<typeof KitSidePanel> | null>(null);
    const [keyToForceRerender, setKeyToForceRerender] = useState(NO_RENDER_KEY);

    const closeSidePanelForm = () => {
        if (sidePanelPropsRef.current && sidePanelPropsRef.current.onClose) {
            sidePanelPropsRef.current.onClose();
        }

        sidePanelPropsRef.current = null;
        setKeyToForceRerender(NO_RENDER_KEY);
    };

    const openSidePanelForm: IUseIFrameMessengerOptions['handlers']['onSidePanelForm'] = data => {
        sidePanelPropsRef.current = data;
        setKeyToForceRerender(prev => prev + 1);
    };

    return {
        openSidePanelForm,
        CustomSidePanelForm:
            keyToForceRerender === NO_RENDER_KEY
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
