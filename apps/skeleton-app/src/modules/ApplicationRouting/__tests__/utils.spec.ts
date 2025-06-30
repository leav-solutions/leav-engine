// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getAllPanels, addChildPanelToApplication} from '../utils';
import {IApplication, IWorkspace} from '../types';
import {Panel} from '_ui/hooks/useIFrameMessenger/types';

const userEditionPanel: Panel = {
    id: 'edition',
    name: {
        en: 'Users edition',
        fr: 'Edition des utilisateurs'
    },
    content: {
        formId: 'user_edition',
        type: 'editionForm'
    }
};

const userManagementPanel: Panel = {
    id: 'display',
    name: {
        en: 'User management',
        fr: 'Gestion des utilisateurs'
    },
    content: {
        iframeSource: 'http://core.leav.localhost/app/users',
        type: 'custom'
    }
};

const unreachablePanel: Panel = {
    id: 'unreachable panel',
    name: {fr: 'panel non atteignable'},
    children: [userEditionPanel, userManagementPanel]
};

const explorerPanel: Panel = {
    id: 'parent_panel',
    name: {
        en: 'user management',
        fr: 'Gestion des utilisateurs'
    },
    content: {
        actions: [
            {
                what: unreachablePanel,
                where: 'fullpage'
            }
        ],
        libraryId: '<props>',
        type: 'explorer'
    }
};

const homeWorkspace: IWorkspace = {
    entrypoint: {
        libraryId: 'map',
        type: 'library'
    },
    id: 'home',
    title: {
        en: 'home',
        fr: 'home'
    },
    panels: [explorerPanel]
};

const baseApplication: IApplication = {
    workspaces: [homeWorkspace]
};

describe('utils', () => {
    describe('addChildPanelToApplication', () => {
        const mockPanel: Panel = {id: 'newPanelId', name: {fr: 'New Panel'}, children: []};

        it('should update the panel with child if workspace and panel are valid and panel has no children', () => {
            const result: any = addChildPanelToApplication(mockPanel, baseApplication, {
                workspaceId: 'home',
                panelId: 'display'
            });

            const updatedPanel = result.workspaces[0].panels[0].content.actions[0].what.children[1];
            expect(updatedPanel.content.child).toEqual(mockPanel);
        });

        it('should return original application if workspace is not found', () => {
            const result = addChildPanelToApplication(mockPanel, baseApplication, {
                workspaceId: 'nonexistentWorkspace',
                panelId: 'panel1'
            });

            expect(result).toEqual(baseApplication);
        });

        it('should return original application if panel is not found in workspace', () => {
            const result = addChildPanelToApplication(mockPanel, baseApplication, {
                workspaceId: 'workspace1',
                panelId: 'nonexistentPanel'
            });

            expect(result).toEqual(baseApplication);
        });

        it('should return original application if panel has an empty children property', () => {
            const originalPanel: Panel = {
                id: 'panel1',
                name: {fr: 'tru'},
                children: []
            };
            const appWithChildrenPanel: IApplication = {
                workspaces: [
                    {
                        id: 'workspace1',
                        title: {fr: 'title'},
                        entrypoint: {
                            type: 'entity',
                            libraryId: ''
                        },
                        panels: [originalPanel]
                    }
                ]
            };

            const result: any = addChildPanelToApplication(mockPanel, appWithChildrenPanel, {
                workspaceId: 'workspace1',
                panelId: 'panel1'
            });

            const updatedPanel = result.workspaces[0].panels[0];
            expect(updatedPanel).toEqual(originalPanel);
            expect(result).toEqual(appWithChildrenPanel);
        });
    });

    describe('getAllPanels', () => {
        it('should return all panels as a flat ', () => {
            expect(getAllPanels(baseApplication.workspaces[0])).toEqual([
                userEditionPanel,
                userManagementPanel,
                unreachablePanel,
                explorerPanel
            ]);
        });
    });
});
