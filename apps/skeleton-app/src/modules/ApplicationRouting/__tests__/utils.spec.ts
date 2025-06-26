// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getAllPanels, updateApplication} from '../utils';
import {IApplication} from '../types';
import {Panel} from '_ui/hooks/useIFrameMessenger/types';

const mockPanel: Panel = {id: 'newPanelId', name: {fr: 'New Panel'}, children: []};

const baseApplication: IApplication = {
    workspaces: [
        {
            entrypoint: {
                libraryId: 'map',
                type: 'library'
            },
            id: 'home',
            panels: [
                {
                    content: {
                        actions: [
                            {
                                what: {
                                    children: [
                                        {
                                            content: {
                                                iframeSource: 'http://core.leav.localhost/app/planning',
                                                type: 'custom'
                                            },
                                            id: 'planning',
                                            name: {
                                                en: 'Planning Management',
                                                fr: 'Planning'
                                            }
                                        },
                                        {
                                            content: {
                                                formId: 'edition',
                                                type: 'editionForm'
                                            },
                                            id: 'edition',
                                            name: {
                                                en: 'MAP edition',
                                                fr: 'Informations du PAC'
                                            }
                                        },
                                        {
                                            content: {
                                                actions: [],
                                                attributeSource: 'map_campaigns_list',
                                                type: 'explorer'
                                            },
                                            id: 'campaigns',
                                            name: {
                                                en: 'Campaigns',
                                                fr: 'Campagnes'
                                            }
                                        },
                                        {
                                            content: {
                                                iframeSource:
                                                    'https://xstream-integration.aristid.com/app/cadrage/objectifs-des-campagnes',
                                                type: 'custom'
                                            },
                                            id: 'campaignsGoals',
                                            name: {
                                                en: 'Goals per Campaigns',
                                                fr: 'Objectifs par campagne'
                                            }
                                        }
                                    ],
                                    name: {fr: 'truc'},
                                    id: 'unreachable PAC'
                                },
                                where: 'fullpage'
                            }
                        ],
                        libraryId: '<props>',
                        type: 'explorer'
                    },
                    id: 'PACs',
                    name: {
                        en: 'MAPs Management',
                        fr: 'Gestion des PACs'
                    }
                }
            ],
            title: {
                en: 'Roadmap',
                fr: 'Roadmap'
            }
        }
    ]
};

describe('utils', () => {
    describe('updateApplication', () => {
        it('should update the panel with child if workspace and panel are valid and panel has no children', () => {
            const result = updateApplication(baseApplication, mockPanel, 'home', 'campaignsGoals');

            //@ts-expect-error
            const updatedPanel = result.workspaces[0].panels[0].content.actions[0].what.children[3];
            expect(updatedPanel.child).toEqual(mockPanel);
        });

        it('should return original application if workspace is not found', () => {
            const result = updateApplication(baseApplication, mockPanel, 'nonexistentWorkspace', 'panel1');

            expect(result).toEqual(baseApplication);
        });

        it('should return original application if panel is not found in workspace', () => {
            const result = updateApplication(baseApplication, mockPanel, 'workspace1', 'nonexistentPanel');

            expect(result).toEqual(baseApplication);
        });

        it('should return original application if panel has children property', () => {
            const appWithChildrenPanel: IApplication = {
                workspaces: [
                    {
                        id: 'workspace1',
                        title: {fr: 'title'},
                        entrypoint: {
                            type: 'entity',
                            libraryId: ''
                        },
                        panels: [
                            {
                                id: 'panel1',
                                name: {fr: 'tru'},
                                children: []
                            }
                        ]
                    }
                ]
            };

            const result = updateApplication(appWithChildrenPanel, mockPanel, 'workspace1', 'panel1');

            const updatedPanel = result.workspaces[0].panels[0] as any;
            expect(updatedPanel.child).toBeUndefined();
            expect(result).toEqual(appWithChildrenPanel);
        });
    });

    describe('getAllPanels', () => {
        it('should return all panels as a flat array', () => {
            expect(getAllPanels(baseApplication.workspaces[0])).toEqual([
                {
                    content: {iframeSource: 'http://core.leav.localhost/app/planning', type: 'custom'},
                    id: 'planning',
                    name: {en: 'Planning Management', fr: 'Planning'}
                },
                {
                    content: {formId: 'edition', type: 'editionForm'},
                    id: 'edition',
                    name: {en: 'MAP edition', fr: 'Informations du PAC'}
                },
                {
                    content: {actions: [], attributeSource: 'map_campaigns_list', type: 'explorer'},
                    id: 'campaigns',
                    name: {en: 'Campaigns', fr: 'Campagnes'}
                },
                {
                    content: {
                        iframeSource: 'https://xstream-integration.aristid.com/app/cadrage/objectifs-des-campagnes',
                        type: 'custom'
                    },
                    id: 'campaignsGoals',
                    name: {en: 'Goals per Campaigns', fr: 'Objectifs par campagne'}
                },
                {
                    children: [
                        {
                            content: {iframeSource: 'http://core.leav.localhost/app/planning', type: 'custom'},
                            id: 'planning',
                            name: {en: 'Planning Management', fr: 'Planning'}
                        },
                        {
                            content: {formId: 'edition', type: 'editionForm'},
                            id: 'edition',
                            name: {en: 'MAP edition', fr: 'Informations du PAC'}
                        },
                        {
                            content: {actions: [], attributeSource: 'map_campaigns_list', type: 'explorer'},
                            id: 'campaigns',
                            name: {en: 'Campaigns', fr: 'Campagnes'}
                        },
                        {
                            content: {
                                iframeSource:
                                    'https://xstream-integration.aristid.com/app/cadrage/objectifs-des-campagnes',
                                type: 'custom'
                            },
                            id: 'campaignsGoals',
                            name: {en: 'Goals per Campaigns', fr: 'Objectifs par campagne'}
                        }
                    ],
                    id: 'unreachable PAC',
                    name: {fr: 'truc'}
                },
                {
                    content: {
                        actions: [
                            {
                                what: {
                                    children: [
                                        {
                                            content: {
                                                iframeSource: 'http://core.leav.localhost/app/planning',
                                                type: 'custom'
                                            },
                                            id: 'planning',
                                            name: {en: 'Planning Management', fr: 'Planning'}
                                        },
                                        {
                                            content: {formId: 'edition', type: 'editionForm'},
                                            id: 'edition',
                                            name: {en: 'MAP edition', fr: 'Informations du PAC'}
                                        },
                                        {
                                            content: {
                                                actions: [],
                                                attributeSource: 'map_campaigns_list',
                                                type: 'explorer'
                                            },
                                            id: 'campaigns',
                                            name: {en: 'Campaigns', fr: 'Campagnes'}
                                        },
                                        {
                                            content: {
                                                iframeSource:
                                                    'https://xstream-integration.aristid.com/app/cadrage/objectifs-des-campagnes',
                                                type: 'custom'
                                            },
                                            id: 'campaignsGoals',
                                            name: {en: 'Goals per Campaigns', fr: 'Objectifs par campagne'}
                                        }
                                    ],
                                    id: 'unreachable PAC',
                                    name: {fr: 'truc'}
                                },
                                where: 'fullpage'
                            }
                        ],
                        libraryId: '<props>',
                        type: 'explorer'
                    },
                    id: 'PACs',
                    name: {en: 'MAPs Management', fr: 'Gestion des PACs'}
                }
            ]);
        });
    });
});
