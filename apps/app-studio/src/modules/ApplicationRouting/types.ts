import type * as z from 'zod/v4';
import {
    type ExplorerPropsSchema,
    type ItemActionsSchema,
    type ViewSettingsTabSchema,
} from '_ui/hooks/usePanelMessenger/schema';
import {type ApplicationSchema} from './schema';

export type ExplorerProps = z.infer<typeof ExplorerPropsSchema>;

export type ItemActions = z.infer<typeof ItemActionsSchema>;

export type ViewSettingsTab = z.infer<typeof ViewSettingsTabSchema>;

export type Application = z.infer<typeof ApplicationSchema>;

export type AppStudioInternalEvent =
    | {type: 'view-settings-select-view'; data: {viewId: string}}
    | {
          type: 'open-view-settings';
          data: {
              selectedTab: ViewSettingsTab;
              currentViewId: string;
              currentLibraryId: string;
              explorerPanelDetails: {
                  libraryId: string;
                  panelType: 'libraryPanels' | 'recordPanels';
                  panelId: string;
              };
          };
      };
