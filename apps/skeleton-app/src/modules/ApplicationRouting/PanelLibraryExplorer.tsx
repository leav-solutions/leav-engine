import {FunctionComponent} from 'react';
import {Explorer} from '_ui/components';
import {explorerContainer} from './PanelContent.module.css';
import {useExplorerProps} from './explorer-panel/useExplorerProps';
import {ItemActions, LibraryExplorerProps} from './types';
import {useItemActions} from './explorer-panel/useItemActions';

interface IPanelLibraryExplorerProps {
    libraryId: string;
    explorerProps: LibraryExplorerProps;
    actions: ItemActions;
}

export const PanelLibraryExplorer: FunctionComponent<IPanelLibraryExplorerProps> = ({
    libraryId,
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
                itemActions={itemActions}
                {...commonExplorerProps}
                {...libraryExplorerProps}
            />
        </div>
    );
};
