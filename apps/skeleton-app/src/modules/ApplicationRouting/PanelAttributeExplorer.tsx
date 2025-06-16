// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {Explorer} from '_ui/components';
import {explorerContainer} from './PanelContent.module.css';
import {useExplorerProps} from './explorer-panel/useExplorerProps';
import {ItemActions, LibraryExplorerProps} from './types';
import {useItemActions} from './explorer-panel/useItemActions';
import {recordSearchParamsName} from './routes';
import {useLocation} from 'react-router-dom';

interface IPanelExplorerProps {
    libraryId: string;
    attributeSource: string;
    viewId: string | null;
    explorerProps: LibraryExplorerProps;
    actions: ItemActions;
}

export const PanelAttributeExplorer: FunctionComponent<IPanelExplorerProps> = ({
    libraryId,
    attributeSource,
    viewId,
    explorerProps,
    actions
}) => {
    const {search} = useLocation();
    const searchParams = new URLSearchParams(search);
    const {commonExplorerProps} = useExplorerProps({explorerProps});
    const {itemActions} = useItemActions({actions});

    return (
        <div className={explorerContainer}>
            <Explorer
                entrypoint={{
                    type: 'link',
                    linkAttributeId: attributeSource,
                    parentLibraryId: libraryId,
                    parentRecordId: searchParams.get(recordSearchParamsName)
                }}
                defaultViewSettings={{
                    viewId
                }}
                itemActions={itemActions}
                {...commonExplorerProps}
            />
        </div>
    );
};
