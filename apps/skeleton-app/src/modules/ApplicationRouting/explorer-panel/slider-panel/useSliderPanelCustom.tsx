// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useRef, useState} from 'react';
import {KitSidePanel} from 'aristid-ds';
import {PanelCustom} from '../../PanelCustom';
import {AddPanel} from 'modules/ApplicationRouting/types';
import {createPortal} from 'react-dom';
import {SIDE_PANEL_CONTENT_ID} from '../../../../constants';
import {KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';

export type PanelCustomInSliderPanelProps =
    | {
          open: true;
          source: string;
          search: string;
          title: string;
          addPanel: AddPanel;
          key?: number;
      }
    | {open: false};

export const useSliderPanelCustom = () => {
    const [panelCustomProps, setPanelCustomProps] = useState<PanelCustomInSliderPanelProps>({open: false});
    const refPanel = useRef<KitSidePanelRef | null>(null);

    useEffect(() => {
        if (refPanel.current && panelCustomProps.open) {
            refPanel.current.open();
        }
    }, [panelCustomProps]);

    const openSliderPanelCustom = (data: PanelCustomInSliderPanelProps) => {
        if (data.open === false) {
            refPanel.current?.close();
            setPanelCustomProps({open: false});
        } else {
            setPanelCustomProps({
                ...data,
                open: true,
                key: Date.now()
            });
        }
    };

    return {
        openSliderPanelCustom,
        SliderPanelCustom: panelCustomProps.open
            ? createPortal(
                  <KitSidePanel floating closable size="m" ref={refPanel} closeOnEsc closeOnOutsideClick>
                      <div style={{height: '100%'}}>
                          <PanelCustom
                              source={panelCustomProps.source}
                              searchQuery={panelCustomProps.search}
                              title={panelCustomProps.title}
                              addPanel={panelCustomProps.addPanel}
                          />
                      </div>
                  </KitSidePanel>,
                  document.getElementById(SIDE_PANEL_CONTENT_ID)
              )
            : null
    };
};
