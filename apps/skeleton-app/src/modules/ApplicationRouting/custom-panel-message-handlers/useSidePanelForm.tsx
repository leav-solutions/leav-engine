// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {KitSidePanel} from 'aristid-ds';
import {SIDE_PANEL_CONTENT_ID} from '../../../constants';
import {EditRecordPage, CloseOnBlur} from '@leav/ui';
import {IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';

const closedSidePanel = {key: 'closed'} as const;

type EditRecordPageInSidePanelProps =
    | (ComponentProps<typeof EditRecordPage> & {
          key: number;
      })
    | typeof closedSidePanel;

export const useSidePanelForm = () => {
    const [editRecordPageInSidePanelProps, setEditRecordPageInSidePanelProps] =
        useState<EditRecordPageInSidePanelProps>(closedSidePanel);
    const [isSidePanelOpened, setIsSidePanelOpened] = useState(
        editRecordPageInSidePanelProps.key !== closedSidePanel.key
    );
    const refPanel = useRef<KitSidePanelRef | null>(null);

    useEffect(() => {
        if (refPanel.current && editRecordPageInSidePanelProps.key !== closedSidePanel.key) {
            refPanel.current.open();
            setIsSidePanelOpened(true);
        }
    }, [editRecordPageInSidePanelProps]);

    const closeSidePanelForm = (onClose?: () => void) => {
        onClose?.();
        refPanel.current?.close();
        setIsSidePanelOpened(false);
    };

    const openSidePanelForm: IUseIFrameMessengerOptions['handlers']['onSidePanelForm'] = data => {
        setEditRecordPageInSidePanelProps(prevEditRecordPageInSidePanelProps => {
            if (prevEditRecordPageInSidePanelProps.key !== closedSidePanel.key) {
                prevEditRecordPageInSidePanelProps.onClose?.();
            }

            return {
                ...data,
                key:
                    prevEditRecordPageInSidePanelProps.key === closedSidePanel.key
                        ? 0
                        : prevEditRecordPageInSidePanelProps.key + 1
            };
        });
    };

    return {
        openSidePanelForm,
        CustomSidePanelForm:
            editRecordPageInSidePanelProps.key === closedSidePanel.key
                ? null
                : createPortal(
                      <CloseOnBlur isElementOpen={isSidePanelOpened} closeElement={closeSidePanelForm}>
                          <KitSidePanel
                              ref={refPanel}
                              style={{transitionDelay: '100ms'}}
                              floating
                              closable
                              size="m"
                              onClose={() => closeSidePanelForm(editRecordPageInSidePanelProps.onClose)}
                              closeOnEsc
                              closeOnOutsideClick
                          >
                              <div style={{height: '100%'}}>
                                  <EditRecordPage
                                      record={null}
                                      library={null}
                                      {...editRecordPageInSidePanelProps}
                                      showRefreshButton={false}
                                      onClose={() => closeSidePanelForm(editRecordPageInSidePanelProps.onClose)}
                                  />
                              </div>
                          </KitSidePanel>
                      </CloseOnBlur>,
                      document.getElementById(SIDE_PANEL_CONTENT_ID)
                  )
    };
};
