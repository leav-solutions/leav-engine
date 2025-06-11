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
    explorerProps: LibraryExplorerProps;
    actions: ItemActions;
}

export const PanelAttributeExplorer: FunctionComponent<IPanelExplorerProps> = ({
    libraryId,
    attributeSource,
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
                itemActions={itemActions}
                {...commonExplorerProps}
            />
        </div>
    );
};
