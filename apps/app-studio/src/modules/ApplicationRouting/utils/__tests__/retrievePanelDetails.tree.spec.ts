import {type Application} from '../../types';
import {retrievePanelDetails} from '../retrievePanelDetails';
import {getTreeWorkspacePanelId} from '../treeWorkspacePanel';

const application = {
    workspaces: [
        {
            id: 'ws-tree',
            icon: 'folder-tree',
            type: 'tree',
            treeId: 'my_tree',
        },
    ],
    libraries: {},
} as unknown as Application;

describe('retrievePanelDetails - tree workspace', () => {
    it('resolves the implicit treeExplorer panel of a tree workspace', () => {
        const panelId = getTreeWorkspacePanelId('ws-tree');

        const {currentPanel, libraryId, panelType} = retrievePanelDetails({application, panelId});

        expect(currentPanel).toMatchObject({type: 'treeExplorer', treeId: 'my_tree'});
        expect(libraryId).toBeNull();
        expect(panelType).toBeNull();
    });
});
