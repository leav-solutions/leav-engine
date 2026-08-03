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
    explorerProps: ExplorerProps | undefined;
    actions: ItemActions;
}

export const PanelLibraryExplorer: FunctionComponent<IPanelLibraryExplorerProps> = ({
    libraryId,
    explorerProps,
    actions,
}) => {
    const [application] = useApplicationSettingsContext();
    const {lang} = useLang();
    const navigate = useNavigate();

    const commonExplorerProps = mapToCommonExplorerProps({explorerProps});
    const itemActions = mapperToItemActions({actions, application, lang, navigate, libraryId});

    const viewSettingsProps = useViewSettingsProps();

    const entrypoint = {type: 'library', libraryId} as const;

    // TODO: Should be deleted when ViewV2 will be fully integrated and ExplorerV2 will be renamed to Explorer.
    if (application.enableViewSettings) {
        // ExplorerV2 no longer accepts `defaultViewSettings`; it is driven by the controlled `currentView` prop.
        const {defaultViewSettings: _legacyViewSettings, ...commonExplorerPropsV2} = commonExplorerProps;

        return (
            <div className={explorerContainer}>
                <ExplorerV2
                    {...commonExplorerPropsV2}
                    entrypoint={entrypoint}
                    itemActions={itemActions}
                    hideFirstActionLabel
                    currentView={viewSettingsProps.currentView}
                    isViewLoading={viewSettingsProps.isViewLoading}
                    defaultCallbacks={viewSettingsProps.defaultCallbacks}
                />
            </div>
        );
    }

    return (
        <div className={explorerContainer}>
            <Explorer
                {...commonExplorerProps}
                defaultViewSettings={commonExplorerProps.defaultViewSettings}
                entrypoint={entrypoint}
                itemActions={itemActions}
                hideFirstActionLabel
            />
        </div>
    );
};
