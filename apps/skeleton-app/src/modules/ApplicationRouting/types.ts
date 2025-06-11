// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
type PanelId = string;
type WorkspaceId = string;
type Language = string;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type CommonExplorerProps = {
    showSearch?: boolean;
    defaultActionsForItem?: Array<'edit' | 'replaceLink' | 'remove' | 'activate'>;
    defaultPrimaryActions?: Array<'create'>;
    defaultMassActions?: Array<'deactivate'>;
    showFiltersAndSorts?: boolean;
    freezeView?: boolean;
    hideTableHeader?: boolean;
    creationFormId?: string;
    editionFormId?: string;
};

export type LinkExplorerProps = {} & CommonExplorerProps;

export type LibraryExplorerProps = {
    noPagination?: true;
} & CommonExplorerProps;

export type Panel = {
    // panel details
    id: PanelId;
    name: Record<Language, string>;
} & (
    | {
          content:
              | {
                    type: 'explorer'; // TODO: you can split types into link-explorer and library-explorer
                    // TODO: later add behavior on click on explorer item
                    attributeSource: string;
                    explorerProps?: LinkExplorerProps;
                    actions: Array<{
                        what: Panel; // | WorkspaceId
                        where: 'popup' | 'slider' | 'fullpage';
                    }>;
                }
              | {
                    type: 'explorer'; // TODO: you can split types into link-explorer and library-explorer
                    libraryId: '<props>' | string;
                    explorerProps?: LibraryExplorerProps;
                    actions: Array<{
                        what: Panel; // | WorkspaceId
                        where: 'popup' | 'slider' | 'fullpage';
                    }>;
                }
              | {
                    type: 'custom';
                    iframeSource: string;
                }
              | {
                    type: 'editionForm';
                    formId: string;
                }
              | {
                    type: 'creationForm';
                    formId: string;
                };
      }
    | {
          children: Panel[];
      }
);

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
