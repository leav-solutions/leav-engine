// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {Explorer, useLang} from '@leav/ui';
import {useNavigate} from 'react-router-dom';
import {type ItemActions, type ExplorerProps} from '../../types';
import {mapToCommonExplorerProps} from './mapperToCommonExplorerProps';
import {mapperToItemActions} from './mapperToItemActions';
import {useApplicationSettingsContext} from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {explorerContainer} from './panelExplorer.module.css';

interface IPanelLibraryExplorerProps {
    libraryId: string;
    viewId: string | undefined;
    explorerProps: ExplorerProps | undefined;
    actions: ItemActions;
}

export const PanelLibraryExplorer: FunctionComponent<IPanelLibraryExplorerProps> = ({
    libraryId,
    viewId,
    explorerProps,
    actions,
}) => {
    const [application] = useApplicationSettingsContext();
    const {lang} = useLang();
    const navigate = useNavigate();

    const commonExplorerProps = mapToCommonExplorerProps({explorerProps});
    const itemActions = mapperToItemActions({actions, application, lang, navigate, libraryId});

    return (
        <div className={explorerContainer}>
            <Explorer
                {...commonExplorerProps}
                defaultViewSettings={{
                    viewId,
                    ...commonExplorerProps.defaultViewSettings,
                }}
                entrypoint={{
                    type: 'library',
                    libraryId,
                }}
                itemActions={itemActions}
                hideFirstActionLabel
            />
        </div>
    );
};
