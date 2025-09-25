// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, useState} from 'react';
import {createPortal} from 'react-dom';
import {KitSidePanel} from 'aristid-ds';
import {SIDE_PANEL_CONTENT_ID} from '../../../constants';
import {EditRecordPage} from '@leav/ui';
import {type IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {RecordIdCard} from '../navigation-menu/RecordIdCard';

const closedSidePanel = {key: 'closed'} as const;

type EditRecordPageInSidePanelProps =
    | (ComponentProps<typeof EditRecordPage> & {
          key: number;
      })
    | typeof closedSidePanel;

export const useSidePanelForm = () => {
    const [editRecordPageInSidePanelProps, setEditRecordPageInSidePanelProps] =
        useState<EditRecordPageInSidePanelProps>(closedSidePanel);

    const closeSidePanelForm = (onClose?: () => void) => {
        onClose?.();
        setEditRecordPageInSidePanelProps(closedSidePanel);
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
                      <KitSidePanel
                          initialOpen
                          floating
                          closable
                          size="l"
                          onClose={() => closeSidePanelForm(editRecordPageInSidePanelProps.onClose)}
                          headerExtra={
                              <RecordIdCard
                                  currentRecordId={editRecordPageInSidePanelProps.record.id}
                                  libraryId={editRecordPageInSidePanelProps.record.library.id}
                              />
                          }
                          closeOnEsc
                      >
                          <div style={{height: '100%'}}>
                              <EditRecordPage
                                  record={null}
                                  library={null}
                                  {...editRecordPageInSidePanelProps}
                                  showRefreshButton={false}
                                  showHeader={false}
                                  enableSidebar={false}
                                  showSidebar={false}
                                  sidebarContainer={undefined}
                                  onClose={() => closeSidePanelForm(editRecordPageInSidePanelProps.onClose)}
                              />
                          </div>
                      </KitSidePanel>,
                      document.getElementById(SIDE_PANEL_CONTENT_ID)
                  )
    };
};
