import {type FunctionComponent} from 'react';
import {Explorer, ExplorerV2, useLang} from '@leav/ui';
import {useNavigate} from 'react-router-dom';
import {type ItemActions, type ExplorerProps} from '../../types';
import {mapToCommonExplorerProps} from './mapperToCommonExplorerProps';
import {mapperToItemActions} from './mapperToItemActions';
import {mapperToCreationActions} from './mapperToCreationActions';
import {useApplicationSettingsContext} from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {useViewSettingsProps} from './useViewSettingsProps';
import {explorerContainer} from './panelExplorer.module.css';

// Stable reference: disables the explorer built-in `create` when `creationPanels` are declared.
const NO_DEFAULT_PRIMARY_ACTIONS: Array<'create'> = [];

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

    const creationPanels = application.libraries[libraryId]?.creationPanels ?? [];
    // Declared creationPanels replace the built-in `create` (spread after the common props to
    // override any `defaultPrimaryActions` coming from the explorerProps config).
    const creationProps =
        creationPanels.length > 0
            ? {
                  primaryActions: mapperToCreationActions({creationPanels, lang, navigate}),
                  defaultPrimaryActions: NO_DEFAULT_PRIMARY_ACTIONS,
              }
            : {};

    // TODO: Should be deleted when ViewV2 will be fully integrated and ExplorerV2 will be renamed to Explorer.
    if (application.enableViewSettings) {
        // ExplorerV2 no longer accepts `defaultViewSettings`; it is driven by the controlled `currentView` prop.
        const {defaultViewSettings: _legacyViewSettings, ...commonExplorerPropsV2} = commonExplorerProps;

        return (
            <div className={explorerContainer}>
                <ExplorerV2
                    {...commonExplorerPropsV2}
                    {...creationProps}
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
                {...creationProps}
                defaultViewSettings={commonExplorerProps.defaultViewSettings}
                entrypoint={entrypoint}
                itemActions={itemActions}
                hideFirstActionLabel
            />
        </div>
    );
};
