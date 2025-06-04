// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '_ui/_tests/testUtils';
import {useApplicationMatching} from '../useApplicationMatching';
import {IWorkspace, Panel} from '../types';

describe('useApplicationMatching', () => {
    it('should return empty on panelId not found', async () => {
        const {
            result: {current}
        } = renderHook(() => useApplicationMatching([], 'unknownPanelId'));

        expect(current).toEqual({
            currentPanel: null,
            currentParentTuple: null,
            currentWorkspace: null
        });
    });

    it('should return panel infos on panelId found without parent', async () => {
        const panelUsers: Panel = {
            id: 'users',
            name: {
                en: 'Users',
                fr: 'Utilisateurs'
            },
            content: {
                type: 'explorer',
                libraryId: '<props>',
                actions: []
            }
        };
        const usersWorkspace: IWorkspace = {
            id: 'home',
            title: {
                en: 'Home',
                fr: 'Accueil'
            },
            entrypoint: {
                type: 'library',
                libraryId: 'users'
            },
            panels: [panelUsers]
        };
        const {
            result: {current}
        } = renderHook(() => useApplicationMatching([usersWorkspace], 'users'));

        expect(current).toEqual({
            currentWorkspace: usersWorkspace,
            currentPanel: panelUsers,
            currentParentTuple: null
        });
    });

    it('should return panel infos on panelId found with parent', async () => {
        const panelUsers: Panel = {
            id: 'users',
            name: {
                en: 'Users',
                fr: 'Utilisateurs'
            },
            content: {
                type: 'explorer',
                libraryId: '<props>',
                actions: []
            }
        };
        const unreachablePanel: Panel = {
            id: 'unreachablePanel',
            name: {
                en: 'Unreachable Panel',
                fr: 'Panneau Inaccessible'
            },
            children: [
                panelUsers,
                {
                    id: 'test',
                    name: {
                        en: 'Test',
                        fr: 'Test'
                    },
                    content: {
                        type: 'custom',
                        iframeSource: 'https://www.google.com'
                    }
                }
            ]
        };
        const usersWorkspace: IWorkspace = {
            id: 'home',
            title: {
                en: 'Home',
                fr: 'Accueil'
            },
            entrypoint: {
                type: 'library',
                libraryId: 'users'
            },
            panels: [unreachablePanel]
        };
        const {
            result: {current}
        } = renderHook(() => useApplicationMatching([usersWorkspace], 'users'));

        expect(current).toEqual({
            currentWorkspace: usersWorkspace,
            currentPanel: panelUsers,
            currentParentTuple: [unreachablePanel, usersWorkspace]
        });
    });
});
