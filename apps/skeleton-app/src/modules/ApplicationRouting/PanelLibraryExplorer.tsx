// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {Explorer} from '_ui/components';
import {explorerContainer} from './PanelContent.module.css';
import {useExplorerProps} from './explorer-panel/useExplorerProps';
import {ItemActions, LibraryExplorerProps} from './types';
import {useItemActions} from './explorer-panel/useItemActions';

interface IPanelLibraryExplorerProps {
    libraryId: string;
    viewId: string | null;
    explorerProps: LibraryExplorerProps;
    actions: ItemActions;
}

export const PanelLibraryExplorer: FunctionComponent<IPanelLibraryExplorerProps> = ({
    libraryId,
    viewId,
    explorerProps,
    actions
}) => {
    const {commonExplorerProps, libraryExplorerProps} = useExplorerProps({explorerProps});
    const {itemActions} = useItemActions({actions});

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
        </div>
    );
};
