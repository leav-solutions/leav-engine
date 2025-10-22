// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {Explorer, useLang} from '@leav/ui';
import {useNavigate} from 'react-router-dom';
import {type ItemActions, type LibraryExplorerProps} from '../types';
import {mapToCommonExplorerProps, mapToLibraryExplorerProps} from './explorer-panel/mapperToExplorerProps';
import {mapperToItemActions} from './explorer-panel/mapperToItemActions';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/ApplicationSettingsContext';

import {explorerContainer} from './panelContent.module.css';

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
    const [application] = useApplicationSettingsContext();
    const {lang} = useLang();
    const navigate = useNavigate();

    const commonExplorerProps = mapToCommonExplorerProps({explorerProps});
    const libraryExplorerProps = explorerProps ? mapToLibraryExplorerProps({explorerProps}) : {};
    const itemActions = mapperToItemActions({actions, application, lang, navigate, libraryId});

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
                hideFirstActionLabel={true}
            />
        </div>
    );
};
