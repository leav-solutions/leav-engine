// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useRef, useState} from 'react';
import {ItemActions, LibraryExplorerProps} from '_ui/hooks/useIFrameMessenger/types';
import {KitSidePanel} from 'aristid-ds';
import {PanelLibraryExplorer} from '../../PanelLibraryExplorer';
import {AddPanel} from 'modules/ApplicationRouting/types';
import {KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {createPortal} from 'react-dom';
import {SIDE_PANEL_CONTENT_ID} from '../../../../constants';

export type ExplorerInSliderPanelProps =
    | {
          open: true;
          libraryId: string;
          viewId: string | null;
          explorerProps: LibraryExplorerProps;
          actions: ItemActions;
          attributeSource?: string;
          recordId?: string;
          key?: number;
          addPanel: AddPanel;
      }
    | {open: false};

export const useSliderPanelExplorer = () => {
    const [explorerProps, setExplorerProps] = useState<ExplorerInSliderPanelProps>({open: false});
    const refPanel = useRef<KitSidePanelRef | null>(null);

    useEffect(() => {
        if (refPanel.current && explorerProps.open) {
            refPanel.current.open();
        }
    }, [explorerProps]);

    const openSliderPanelExplorer = (data: ExplorerInSliderPanelProps) => {
        if (data.open === false) {
            refPanel.current?.close();
        } else {
            setExplorerProps({
                ...data,
                open: true,
                key: Date.now()
            });
        }
    };

    return {
        openSliderPanelExplorer,
        SliderPanelExplorer: explorerProps.open
            ? createPortal(
                  <KitSidePanel floating closable size="m" ref={refPanel} closeOnEsc closeOnOutsideClick>
                      <div style={{height: '100%'}}>
                          <PanelLibraryExplorer
                              libraryId={explorerProps.libraryId}
                              viewId={explorerProps.viewId}
                              explorerProps={explorerProps.explorerProps}
                              actions={explorerProps.actions}
                              addPanel={explorerProps.addPanel}
                          />
                      </div>
                  </KitSidePanel>,
                  document.getElementById(SIDE_PANEL_CONTENT_ID)
              )
            : null
    };
};
