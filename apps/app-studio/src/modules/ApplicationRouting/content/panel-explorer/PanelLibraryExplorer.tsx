import {type FunctionComponent} from 'react';
import {Explorer, ExplorerV2, useLang} from '@leav/ui';
import {useNavigate} from 'react-router-dom';
import {type ItemActions, type ExplorerProps} from '../../types';
import {mapToCommonExplorerProps} from './mapperToCommonExplorerProps';
import {mapperToItemActions} from './mapperToItemActions';
import {useApplicationSettingsContext} from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {useViewSettingsProps} from './useViewSettingsProps';
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

    const viewSettingsProps = useViewSettingsProps({viewId});

    // TODO: Should be deleted when ViewV2 will be fully integrated and ExplorerV2 will be renamed to Explorer
    const ExplorerComponent = application.enableViewSettings ? ExplorerV2 : Explorer;

    return (
        <div className={explorerContainer}>
            <ExplorerComponent
                {...commonExplorerProps}
                defaultViewSettings={{
                    ...commonExplorerProps.defaultViewSettings,
                    ...viewSettingsProps.defaultViewSettings,
                }}
                entrypoint={{
                    type: 'library',
                    libraryId,
                }}
                itemActions={itemActions}
                hideFirstActionLabel
                {...viewSettingsProps}
            />
        </div>
    );
};
