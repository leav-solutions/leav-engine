// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {KitSidePanel} from 'aristid-ds';
import {SIDE_PANEL_CONTENT_ID} from '../../../../constants';
import {EditRecordPage} from '@leav/ui';
import {ComponentPropsWithKey} from '_ui/hooks/useIFrameMessenger/types';
import {KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';

export type EditRecordPageInSliderPanelProps =
    | (ComponentPropsWithKey<typeof EditRecordPage> & {
          open: true;
      })
    | {open: false};

export const useSliderPanelForm = () => {
    const [editRecordPageProps, setEditRecordPageProps] = useState<EditRecordPageInSliderPanelProps>({open: false});
    const refPanel = useRef<KitSidePanelRef | null>(null);

    useEffect(() => {
        if (refPanel.current && editRecordPageProps.open) {
            refPanel.current.open();
        }
    }, [editRecordPageProps]);

    const openSliderPanelForm = (data: EditRecordPageInSliderPanelProps) => {
        if (data.open === false) {
            refPanel.current?.close();
            setEditRecordPageProps({open: false});
        } else {
            setEditRecordPageProps({
                ...data,
                open: true,
                key: Date.now(),
                onClose: () => {
                    refPanel.current?.close();
                    data.onClose();
                }
            });
        }
    };

    return {
        openSliderPanelForm,
        SliderPanelForm: editRecordPageProps.open
            ? createPortal(
                  <KitSidePanel floating closable size="m" ref={refPanel} closeOnEsc closeOnOutsideClick>
                      <div style={{height: '100%'}}>
                          <EditRecordPage
                              record={null}
                              library={null}
                              {...editRecordPageProps}
                              showRefreshButton={false}
                          />
                      </div>
                  </KitSidePanel>,
                  document.getElementById(SIDE_PANEL_CONTENT_ID)
              )
            : null
    };
};
