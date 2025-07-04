// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {ItemActions, LibraryExplorerProps} from '_ui/hooks/useIFrameMessenger/types';
import {KitModal} from 'aristid-ds';
import {PanelLibraryExplorer} from '../../PanelLibraryExplorer';
import {PanelAttributeExplorer} from '../../PanelAttributeExplorer';
import {AddPanel} from 'modules/ApplicationRouting/types';

export type ExplorerInPopupPanelProps =
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

export const usePopupPanelExplorer = () => {
    const [explorerProps, setExplorerProps] = useState<ExplorerInPopupPanelProps>({open: false});

    const closePopupPanelExplorer = () => setExplorerProps({open: false});

    const openPopupPanelExplorer = (data: ExplorerInPopupPanelProps) => {
        if (data.open === false) {
            closePopupPanelExplorer();
        } else {
            setExplorerProps({
                ...data,
                open: true,
                key: Date.now()
            });
        }
    };

    return {
        openPopupPanelExplorer,
        PopupPanelExplorer: explorerProps.open && (
            <KitModal
                key={explorerProps.key}
                isOpen={explorerProps.open}
                height="80vh"
                width="90vw"
                showCloseIcon
                close={closePopupPanelExplorer}
            >
                {explorerProps?.attributeSource ? (
                    <PanelAttributeExplorer
                        libraryId={explorerProps.libraryId}
                        attributeSource={explorerProps.attributeSource}
                        viewId={explorerProps.viewId}
                        explorerProps={explorerProps.explorerProps}
                        actions={explorerProps.actions}
                        recordId={explorerProps.recordId}
                        addPanel={explorerProps.addPanel}
                    />
                ) : (
                    <PanelLibraryExplorer
                        libraryId={explorerProps?.libraryId}
                        viewId={explorerProps?.viewId}
                        explorerProps={explorerProps?.explorerProps}
                        actions={explorerProps?.actions}
                        addPanel={explorerProps.addPanel}
                    />
                )}
            </KitModal>
        )
    };
};
