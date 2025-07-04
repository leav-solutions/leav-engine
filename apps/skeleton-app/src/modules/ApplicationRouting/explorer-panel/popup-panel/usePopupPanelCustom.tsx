// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {KitModal} from 'aristid-ds';
import {PanelCustom} from '../../PanelCustom';
import {AddPanel} from 'modules/ApplicationRouting/types';

export type PanelCustomInPopupPanelProps =
    | {
          open: true;
          source: string;
          search: string;
          title: string;
          addPanel: AddPanel;
          key?: number;
      }
    | {open: false};

export const usePopupPanelCustom = () => {
    const [panelCustomProps, setPanelCustomProps] = useState<PanelCustomInPopupPanelProps>({open: false});

    const closePopupPanelCustom = () => setPanelCustomProps({open: false});

    const openPopupPanelCustom = (data: PanelCustomInPopupPanelProps) => {
        if (data.open === false) {
            closePopupPanelCustom();
        } else {
            setPanelCustomProps({
                ...data,
                open: true,
                key: Date.now()
            });
        }
    };

    return {
        openPopupPanelCustom,
        PopupPanelCustom: panelCustomProps.open && (
            <KitModal
                key={panelCustomProps.key}
                isOpen={panelCustomProps.open}
                height="80vh"
                width="90vw"
                showCloseIcon
                close={closePopupPanelCustom}
            >
                <PanelCustom
                    source={panelCustomProps.source}
                    searchQuery={panelCustomProps.search}
                    title={panelCustomProps.title}
                    addPanel={panelCustomProps.addPanel}
                />
            </KitModal>
        )
    };
};
