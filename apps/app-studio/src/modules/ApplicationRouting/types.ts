// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import type * as z from 'zod/v4';
import {type Panel} from '_ui/hooks/useIFrameMessenger/types';
import {type ItemActionsSchema, type LibraryExplorerPropsSchema} from '_ui/hooks/useIFrameMessenger/schema';
import {type ApplicationSchema, type WorkspaceSchema} from './schema';

export type LibraryExplorerProps = z.infer<typeof LibraryExplorerPropsSchema>;

export type ItemActions = z.infer<typeof ItemActionsSchema>;

export type Workspace = z.infer<typeof WorkspaceSchema>;

export type Application = z.infer<typeof ApplicationSchema>;

export interface IApplicationMatchingContext {
    currentWorkspace: Workspace | null;
    currentFullpagePanel: Panel | null;
    currentPopupPanel: Panel | null;
    currentSliderPanel: Panel | null;
    currentFullpageParentTuple: [Panel, Workspace] | null;
    currentPopupParentTuple: [Panel, Workspace] | null;
    currentSliderParentTuple: [Panel, Workspace] | null;
}

export type ApplicationMatchingContextWithoutFullpageParentTuple = Omit<
    IApplicationMatchingContext,
    'currentFullpageParentTuple'
> & {
    recordId: string | null;
};

export type AddPanel = (panel: Panel, destination: {workspaceId: string; panelId: string}) => void;

export type PanelLevel = 'fullpage' | 'popup' | 'slider';
