import type * as z from 'zod/v4';
import {type HiddenFullFilter} from '@leav/ui';
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

export type CreationPanels = NonNullable<Application['libraries'][string]['creationPanels']>;

export type AppStudioInternalEvent =
    | {type: 'view-settings-select-view'; data: {viewId: string}}
    | {
          type: 'set-panel-view-settings';
          data: {
              selectedTab: ViewSettingsTab;
              currentViewId: string;
              currentLibraryId: string;
              displayViewSettingsIframeSource?: string;
              hiddenTabs?: ViewSettingsTab[];
              hiddenFilters?: HiddenFullFilter[];
              explorerPanelDetails: {
                  libraryId: string;
                  panelType: keyof Application['libraries'][string];
                  panelId: string;
              };
          };
      };
