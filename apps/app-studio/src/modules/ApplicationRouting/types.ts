// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as z from 'zod/v4';
import {Panel} from '_ui/hooks/useIFrameMessenger/types';
import {ItemActionsSchema, LibraryExplorerPropsSchema} from '_ui/hooks/useIFrameMessenger/schema';
import {ApplicationSchema, WorkspaceSchema} from './schema';

export type LibraryExplorerProps = z.infer<typeof LibraryExplorerPropsSchema>;

export type ItemActions = z.infer<typeof ItemActionsSchema>;

export type Workspace = z.infer<typeof WorkspaceSchema>;

export type Application = z.infer<typeof ApplicationSchema>;

export interface IApplicationMatchingContext {
    currentWorkspace: Workspace;
    currentPanel: Panel;
    currentPopupPanel: Panel;
    currentSliderPanel: Panel;
    currentParentTuple: [Panel, Workspace] | null;
}

export type ApplicationMatchingContextWithoutParentTuple = Omit<IApplicationMatchingContext, 'currentParentTuple'>;

export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

export type AddPanel = (panel: Panel, destination: {workspaceId: string; panelId: string}) => void;
