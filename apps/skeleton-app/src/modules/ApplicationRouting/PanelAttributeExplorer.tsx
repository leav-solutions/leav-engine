// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {useLocation} from 'react-router-dom';
import {Explorer} from '@leav/ui';
import {explorerContainer} from './PanelContent.module.css';
import {useExplorerProps} from './explorer-panel/useExplorerProps';
import {useItemActions} from './explorer-panel/useItemActions';
import {recordSearchParamsName} from './routes';
import {ItemActions, LibraryExplorerProps} from './types';
import {useLocation} from 'react-router-dom';
import {usePopupPanelForm} from './explorer-panel/popup-panel/usePopupPanelForm';
import {usePopupPanelExplorer} from './explorer-panel/popup-panel/usePopupPanelExplorer';
import {usePopupPanelCustom} from './explorer-panel/popup-panel/usePopupPanelCustom';
import {useSliderPanelExplorer} from './explorer-panel/slider-panel/useSliderPanelExplorer';
import {useSliderPanelCustom} from './explorer-panel/slider-panel/useSliderPanelCustom';
import {useSliderPanelForm} from './explorer-panel/slider-panel/useSliderPanelForm';
import {AddPanel} from './types';

interface IPanelExplorerProps {
    libraryId: string;
    attributeSource: string;
    viewId: string | null;
    explorerProps: LibraryExplorerProps;
    actions: ItemActions;
    addPanel: AddPanel;
    recordId?: string;
}

export const PanelAttributeExplorer: FunctionComponent<IPanelExplorerProps> = ({
    libraryId,
    attributeSource,
    viewId,
    explorerProps,
    actions,
    addPanel,
    recordId
}) => {
    const {search} = useLocation();
    const searchParams = new URLSearchParams(search);
    const {commonExplorerProps} = useExplorerProps({explorerProps});

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
                    type: 'link',
                    linkAttributeId: attributeSource,
                    parentLibraryId: libraryId,
                    parentRecordId: recordId ?? searchParams.get(recordSearchParamsName)
                }}
                defaultViewSettings={{
                    viewId
                }}
                itemActions={itemActions}
                {...commonExplorerProps}
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
