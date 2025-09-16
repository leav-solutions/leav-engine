// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {Explorer, useLang} from '@leav/ui';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {ItemActions, LibraryExplorerProps} from '../../types';
import {mapToCommonExplorerProps, mapToLibraryExplorerProps} from '../../explorer-panel/mapperToExplorerProps';
import {mapperToItemActions} from '../../explorer-panel/mapperToItemActions';
import {explorerContainer} from './PanelContent.module.css';

interface IPanelLibraryExplorerProps {
    libraryId: string;
    viewId: string | undefined;
    explorerProps: LibraryExplorerProps | undefined;
    actions: ItemActions;
}

export const PanelLibraryExplorer: FunctionComponent<IPanelLibraryExplorerProps> = ({
    libraryId,
    viewId,
    explorerProps,
    actions
}) => {
    const {lang} = useLang();
    const navigate = useNavigate();
    const {panelId} = useParams();
    const [searchParams] = useSearchParams();

    const commonExplorerProps = explorerProps ? mapToCommonExplorerProps({explorerProps}) : {};
    const libraryExplorerProps = explorerProps ? mapToLibraryExplorerProps({explorerProps}) : {};
    const itemActions = mapperToItemActions({actions, lang, navigate, panelId, searchParams});

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
