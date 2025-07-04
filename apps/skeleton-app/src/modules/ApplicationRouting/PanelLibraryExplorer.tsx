// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {Explorer} from '@leav/ui';
import {explorerContainer} from './PanelContent.module.css';
import {ItemActions, LibraryExplorerProps} from './types';
import {useExplorerProps} from './explorer-panel/useExplorerProps';
import {useItemActions} from './explorer-panel/useItemActions';
import {ItemActions, LibraryExplorerProps} from '_ui/hooks/useIFrameMessenger/types';
import {usePopupPanelForm} from './explorer-panel/popup-panel/usePopupPanelForm';
import {usePopupPanelExplorer} from './explorer-panel/popup-panel/usePopupPanelExplorer';
import {usePopupPanelCustom} from './explorer-panel/popup-panel/usePopupPanelCustom';
import {useSliderPanelForm} from './explorer-panel/slider-panel/useSliderPanelForm';
import {useSliderPanelExplorer} from './explorer-panel/slider-panel/useSliderPanelExplorer';
import {useSliderPanelCustom} from './explorer-panel/slider-panel/useSliderPanelCustom';
import {AddPanel} from './types';

interface IPanelLibraryExplorerProps {
    libraryId: string;
    viewId: string | null;
    explorerProps: LibraryExplorerProps;
    actions: ItemActions;
    addPanel: AddPanel;
}

export const PanelLibraryExplorer: FunctionComponent<IPanelLibraryExplorerProps> = ({
    libraryId,
    viewId,
    explorerProps,
    actions,
    addPanel
}) => {
    const {commonExplorerProps, libraryExplorerProps} = useExplorerProps({explorerProps});

    const {openPopupPanelForm, PopupPanelForm} = usePopupPanelForm();
    const {openPopupPanelExplorer, PopupPanelExplorer} = usePopupPanelExplorer();
    const {openPopupPanelCustom, PopupPanelCustom} = usePopupPanelCustom();
    const {openSliderPanelForm, SliderPanelForm} = useSliderPanelForm();
    const {openSliderPanelExplorer, SliderPanelExplorer} = useSliderPanelExplorer();
    const {openSliderPanelCustom, SliderPanelCustom} = useSliderPanelCustom();

    const {itemActions} = useItemActions({
        actions,
        addPanel,
        openPopupPanelForm,
        openPopupPanelExplorer,
        openPopupPanelCustom,
        openSliderPanelForm,
        openSliderPanelExplorer,
        openSliderPanelCustom
    });

    return (
        <div className={explorerContainer}>
            <Explorer
                entrypoint={{
                    type: 'library',
                    libraryId
                }}
                defaultViewSettings={{
                    viewId
                }}
                itemActions={itemActions}
                {...commonExplorerProps}
                {...libraryExplorerProps}
            />
            {PopupPanelForm}
            {PopupPanelExplorer}
            {PopupPanelCustom}
            {SliderPanelForm}
            {SliderPanelExplorer}
            {SliderPanelCustom}
        </div>
    );
};
