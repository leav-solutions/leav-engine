import {type ComponentProps, useState} from 'react';
import {useParams} from 'react-router-dom';
import {type Explorer, usePanelEventHandlers} from '@leav/ui';
import {retrievePanelDetails} from '../../utils/retrievePanelDetails';
import {useApplicationSettingsContext} from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type AppStudioInternalEvent} from '../../types';

export const useViewSettingsProps = () => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();

    const {currentPanel, libraryId, panelType} = retrievePanelDetails({application, recordPanelId, panelId});

    // TODO: add logic to retrieve viewId from userData and fallback mechanism as spec in LEAVC-850
    const [loadedViewId, setLoadedViewId] = useState<string | undefined>(undefined);

    const {dispatch} = usePanelEventHandlers<AppStudioInternalEvent>({
        'view-settings-select-view': data => {
            setLoadedViewId(data.viewId);
        },
    });

    const viewConfigProps: Partial<ComponentProps<typeof Explorer>> = application.enableViewSettings
        ? {
              loadedViewId,
              defaultCallbacks: {
                  viewSettings: {
                      onViewSettingsShortcutClick: ({settingName, viewId}) => {
                          if (
                              currentPanel === null ||
                              libraryId === null ||
                              panelType === null ||
                              currentPanel.type !== 'explorer'
                          ) {
                              return null;
                          }

                          dispatch({
                              type: 'open-view-settings',
                              data: {
                                  selectedTab: settingName,
                                  currentViewId: viewId,
                                  currentLibraryId: libraryId,
                                  explorerPanelDetails: {
                                      libraryId,
                                      panelType,
                                      panelId: currentPanel.id,
                                  },
                              },
                          });
                      },
                      onFiltersChange: () => {
                          // TODO: dispatch event to modifyed currentView
                      },
                  },
              },
          }
        : {};

    return viewConfigProps;
};
