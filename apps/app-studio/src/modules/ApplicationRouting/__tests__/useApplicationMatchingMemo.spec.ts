// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '_ui/_tests/testUtils';
import {useApplicationMatchingMemo} from '../useApplicationMatchingMemo';
import {Workspace} from '../types';
import {Panel} from '_ui/hooks/useIFrameMessenger/types';

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

const popupEditUserPanel: Panel = {
    id: 'popupEditUser',
    name: {
        en: 'Popup Panel',
        fr: 'Panneau Popup'
    },
    content: {
        formId: 'edition',
        type: 'editionForm'
    }
};

const sliderEditUserPanel: Panel = {
    id: 'sliderEditUser',
    name: {
        en: 'Slider Panel',
        fr: 'Panneau Slider'
    },
    content: {
        formId: 'edition',
        type: 'editionForm'
    }
};

const usersWorkspaceWithoutPanels: Omit<Workspace, 'panels'> = {
    id: 'home',
    title: {
        en: 'Home',
        fr: 'Accueil'
    },
    entrypoint: {
        type: 'library',
        libraryId: 'users'
    }
};

describe('useApplicationMatchingMemo', () => {
    it('should return empty on panelId not found', async () => {
        const {
            result: {current}
        } = renderHook(() => useApplicationMatchingMemo([], 'unknownPanelId'));

        expect(current).toEqual({
            currentFullpagePanel: null,
            currentPopupPanel: null,
            currentSliderPanel: null,
            currentFullpageParentTuple: null,
            currentPopupParentTuple: null,
            currentSliderParentTuple: null,
            currentWorkspace: null
        });
    });

    it('should return fullpage panel infos on panelId found without parent', async () => {
        const usersWorkspace: Workspace = {
            ...usersWorkspaceWithoutPanels,
            panels: [panelUsers]
        };
        const {
            result: {current}
        } = renderHook(() => useApplicationMatchingMemo([usersWorkspace], 'users'));

        expect(current).toEqual({
            currentWorkspace: usersWorkspace,
            currentFullpagePanel: panelUsers,
            currentPopupPanel: null,
            currentSliderPanel: null,
            currentFullpageParentTuple: null,
            currentPopupParentTuple: null,
            currentSliderParentTuple: null
        });
    });

    it('should return fullpage panel infos on panelId found with parent', async () => {
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
        const usersWorkspace: Workspace = {
            ...usersWorkspaceWithoutPanels,
            panels: [unreachablePanel]
        };
        const {
            result: {current}
        } = renderHook(() => useApplicationMatchingMemo([usersWorkspace], 'users'));

        expect(current).toEqual({
            currentWorkspace: usersWorkspace,
            currentFullpagePanel: panelUsers,
            currentPopupPanel: null,
            currentSliderPanel: null,
            currentFullpageParentTuple: [unreachablePanel, usersWorkspace],
            currentPopupParentTuple: null,
            currentSliderParentTuple: null
        });
    });

    it('should return popup panel infos on popupPanelId found without parent', async () => {
        const panelUsersWithPopupPanel: Panel = {
            ...panelUsers,
            content: {
                ...panelUsers.content,
                actions: [
                    {
                        what: popupEditUserPanel,
                        where: 'popup'
                    }
                ]
            }
        };

        const usersWorkspace: Workspace = {
            ...usersWorkspaceWithoutPanels,
            panels: [panelUsersWithPopupPanel]
        };

        const {
            result: {current}
        } = renderHook(() => useApplicationMatchingMemo([usersWorkspace], 'users', 'popupEditUser'));

        expect(current).toEqual({
            currentWorkspace: usersWorkspace,
            currentFullpagePanel: panelUsersWithPopupPanel,
            currentPopupPanel: popupEditUserPanel,
            currentSliderPanel: null,
            currentFullpageParentTuple: null,
            currentPopupParentTuple: null,
            currentSliderParentTuple: null
        });
    });

    it('should return popup panel infos on popupPanelId found with parent', async () => {
        const unreachablePanel: Panel = {
            id: 'unreachablePanel',
            name: {
                en: 'Unreachable Panel',
                fr: 'Panneau Inaccessible'
            },
            children: [
                popupEditUserPanel,
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
        const panelUsersWithPopupPanel: Panel = {
            ...panelUsers,
            content: {
                ...panelUsers.content,
                actions: [
                    {
                        what: unreachablePanel,
                        where: 'popup'
                    }
                ]
            }
        };

        const usersWorkspace: Workspace = {
            ...usersWorkspaceWithoutPanels,
            panels: [panelUsersWithPopupPanel]
        };

        const {
            result: {current}
        } = renderHook(() => useApplicationMatchingMemo([usersWorkspace], 'users', 'popupEditUser'));

        expect(current).toEqual({
            currentWorkspace: usersWorkspace,
            currentFullpagePanel: panelUsersWithPopupPanel,
            currentPopupPanel: popupEditUserPanel,
            currentSliderPanel: null,
            currentFullpageParentTuple: null,
            currentPopupParentTuple: [unreachablePanel, usersWorkspace],
            currentSliderParentTuple: null
        });
    });

    it('should return slider panel infos on sliderPanelId found without parent', async () => {
        const panelUsersWithSliderPanel: Panel = {
            ...panelUsers,
            content: {
                ...panelUsers.content,
                actions: [
                    {
                        what: sliderEditUserPanel,
                        where: 'slider'
                    }
                ]
            }
        };

        const usersWorkspace: Workspace = {
            ...usersWorkspaceWithoutPanels,
            panels: [panelUsersWithSliderPanel]
        };

        const {
            result: {current}
        } = renderHook(() => useApplicationMatchingMemo([usersWorkspace], 'users', undefined, 'sliderEditUser'));

        expect(current).toEqual({
            currentWorkspace: usersWorkspace,
            currentFullpagePanel: panelUsersWithSliderPanel,
            currentPopupPanel: null,
            currentSliderPanel: sliderEditUserPanel,
            currentFullpageParentTuple: null,
            currentPopupParentTuple: null,
            currentSliderParentTuple: null
        });
    });

    it('should return slider panel infos on sliderPanelId found with parent', async () => {
        const unreachablePanel: Panel = {
            id: 'unreachablePanel',
            name: {
                en: 'Unreachable Panel',
                fr: 'Panneau Inaccessible'
            },
            children: [
                sliderEditUserPanel,
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
        const panelUsersWithSliderPanel: Panel = {
            ...panelUsers,
            content: {
                ...panelUsers.content,
                actions: [
                    {
                        what: unreachablePanel,
                        where: 'slider'
                    }
                ]
            }
        };

        const usersWorkspace: Workspace = {
            ...usersWorkspaceWithoutPanels,
            panels: [panelUsersWithSliderPanel]
        };

        const {
            result: {current}
        } = renderHook(() => useApplicationMatchingMemo([usersWorkspace], 'users', undefined, 'sliderEditUser'));

        expect(current).toEqual({
            currentWorkspace: usersWorkspace,
            currentFullpagePanel: panelUsersWithSliderPanel,
            currentPopupPanel: null,
            currentSliderPanel: sliderEditUserPanel,
            currentFullpageParentTuple: null,
            currentPopupParentTuple: null,
            currentSliderParentTuple: [unreachablePanel, usersWorkspace]
        });
    });
});
