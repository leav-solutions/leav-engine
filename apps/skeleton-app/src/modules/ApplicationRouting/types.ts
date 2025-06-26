// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {type Panel} from '_ui/hooks/useIFrameMessenger/types';

type WorkspaceId = string;
type Language = string;

export interface IWorkspace {
    id: WorkspaceId;
    title: Record<Language, string>;
    description?: string;
    color?: string;
    icon?: string;
    panels: Panel[]; // display first
    entrypoint: {
        type: 'entity' | 'library' | 'entityValue';
        //   |-> PAC 2025 |-> PACs |-> PAC2025.campaigns
        libraryId: string;
    };
}

export interface IApplication {
    // some info
    workspaces: IWorkspace[]; // display first
}

export interface IApplicationMatchingContext {
    currentWorkspace: IWorkspace;
    currentPanel: Panel;
    currentParentTuple: [Panel, IWorkspace] | null;
}

export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};
