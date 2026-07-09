import {type Application} from '../../types';
import {buildTreeWorkspacePanel, getTreeWorkspacePanelId, isTreeWorkspace} from '../treeWorkspacePanel';

type Workspace = Application['workspaces'][number];

const treeWorkspace = {
    id: 'ws-tree',
    icon: 'folder-tree',
    title: {en: 'My tree', fr: 'Mon arbre'},
    type: 'tree',
    treeId: 'my_tree',
} as Extract<Workspace, {type: 'tree'}>;

const libraryWorkspace = {
    id: 'ws-lib',
    icon: 'box',
    type: 'library',
    libraryId: 'products',
} as Workspace;

describe('treeWorkspacePanel', () => {
    it('builds a deterministic panel id from the workspace id', () => {
        expect(getTreeWorkspacePanelId('ws-tree')).toBe('ws-tree--tree-explorer');
    });

    it('detects tree workspaces', () => {
        expect(isTreeWorkspace(treeWorkspace)).toBe(true);
        expect(isTreeWorkspace(libraryWorkspace)).toBe(false);
    });

    it('builds the implicit treeExplorer panel for a tree workspace', () => {
        const panel = buildTreeWorkspacePanel(treeWorkspace);

        expect(panel).toMatchObject({
            id: 'ws-tree--tree-explorer',
            icon: 'folder-tree',
            name: {en: 'My tree', fr: 'Mon arbre'},
            isStandalone: true,
            type: 'treeExplorer',
            treeId: 'my_tree',
        });
    });
});
