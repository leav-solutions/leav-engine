import {type Application} from '../types';

type Workspace = Application['workspaces'][number];
type Panel = Application['libraries'][string]['libraryPanels'][number];
type TreeWorkspace = Extract<Workspace, {type: 'tree'}>;

/**
 * A tree workspace renders a single, implicit `treeExplorer` panel (no configurable panel list).
 * This deterministic id is used both to build the panel and to redirect to it.
 */
export const getTreeWorkspacePanelId = (workspaceId: string): string => `${workspaceId}--tree-explorer`;

export const isTreeWorkspace = (workspace: Workspace): workspace is TreeWorkspace => workspace.type === 'tree';

export const buildTreeWorkspacePanel = (workspace: TreeWorkspace): Panel => {
    const panel: Panel = {
        id: getTreeWorkspacePanelId(workspace.id),
        icon: workspace.icon,
        name: workspace.title,
        isStandalone: true,
        type: 'treeExplorer',
        treeId: workspace.treeId,
    };

    return panel;
};
