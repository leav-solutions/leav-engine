// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {render, screen, within} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import {Mockify} from '@leav/utils';
import {mockAttributeLink, mockAttributeSimple} from '_ui/__mocks__/common/attribute';
import * as gqlTypes from '_ui/_gqlTypes';
import {EditSettingsContextProvider} from './open-view-settings/EditSettingsContextProvider';
import {SidePanel} from './open-view-settings/SidePanel';
import {useOpenViewSettings} from './open-view-settings/useOpenViewSettings';
import {ViewSettingsContext} from './store-view-settings/ViewSettingsContext';
import {act, waitFor} from '@testing-library/react';
import {useViewSettingsReducer} from '../useViewSettingsReducer';
import {DefaultViewSettings} from '../_types';
import {IViewSettingsState} from './store-view-settings/viewSettingsReducer';

const MockOpenEditSettings: FunctionComponent = () => {
    const {viewSettingsButton, viewListButton} = useOpenViewSettings({view: {}, isEnabled: true} as {
        view: IViewSettingsState;
        isEnabled: boolean;
    });

    return (
        <>
            {viewListButton} {viewSettingsButton}
        </>
    );
};

const MockViewSettingsContextProvider: FunctionComponent<{defaultSettings?: DefaultViewSettings}> = ({
    defaultSettings,
    children
}) => {
    const {view, dispatch} = useViewSettingsReducer({type: 'library', libraryId: 'my_lib'}, defaultSettings);
    return <ViewSettingsContext.Provider value={{view, dispatch}}>{children}</ViewSettingsContext.Provider>;
};

describe('Integration tests about managing view settings feature', () => {
    const attributesList = [
        {...mockAttributeSimple, id: 'simple_attribute', label: {fr: 'Attribut simple'}},
        {...mockAttributeLink, id: 'link_attribute', label: {fr: 'Attribut lien'}},
        {...mockAttributeSimple, id: 'simple_attribute_allemand', label: {fr: 'Fußballer Märchenkönig'}},
        {...mockAttributeSimple, id: 'simple_attribute_polonais', label: {fr: 'zdawał się być pogrążonym wnętrzności'}},
        {...mockAttributeSimple, id: 'simple_attribute_français', label: {fr: 'éssai français Noël'}}
    ];
    const mockAttributesByLibResult: Mockify<typeof gqlTypes.useGetAttributesByLibQuery> = {
        data: {attributes: {list: attributesList}},
        loading: false,
        called: true
    };

    const mockSaveViewMutation = jest.fn().mockReturnValue({
        data: {
            saveView: [
                {
                    id: 42
                }
            ]
        }
    });

    const mockViewsResult: Mockify<typeof gqlTypes.useGetViewsListQuery> = {
        data: {
            views: {
                list: [
                    {
                        id: '42',
                        shared: false,
                        display: {
                            type: gqlTypes.ViewTypes.list
                        },
                        created_by: {
                            id: '1',
                            whoAmI: {
                                id: '1',
                                label: 'Admin',
                                library: {
                                    id: 'users'
                                }
                            }
                        },
                        label: {en: 'My view'},
                        filters: [],
                        sort: []
                    }
                ]
            }
        },
        loading: false,
        called: true
    };

    const mockViewsResultWithSort: Mockify<typeof gqlTypes.useGetViewsListQuery> = {
        data: {
            views: {
                list: [
                    {
                        id: '42',
                        shared: false,
                        display: {
                            type: gqlTypes.ViewTypes.list
                        },
                        created_by: {
                            id: '1',
                            whoAmI: {
                                id: '1',
                                label: 'Admin',
                                library: {
                                    id: 'users'
                                }
                            }
                        },
                        label: {en: 'My view'},
                        filters: [],
                        sort: [
                            {
                                field: 'simple_attribute',
                                direction: gqlTypes.SortOrder.asc
                            }
                        ]
                    }
                ]
            }
        },
        loading: false,
        called: true
    };

    const mockExplorerAttributesQuery: Mockify<typeof gqlTypes.useExplorerAttributesQuery> = {
        data: {attributes: {list: attributesList}},
        loading: false,
        called: true
    };

    let getViewsListSpy: jest.SpyInstance;
    beforeAll(() => {
        jest.spyOn(gqlTypes, 'useGetAttributesByLibQuery').mockReturnValue(
            mockAttributesByLibResult as gqlTypes.GetAttributesByLibQueryResult
        );

        getViewsListSpy = jest
            .spyOn(gqlTypes, 'useGetViewsListQuery')
            .mockReturnValue(mockViewsResult as gqlTypes.GetViewsListQueryResult);

        jest.spyOn(gqlTypes, 'useExplorerAttributesQuery').mockReturnValue(
            mockExplorerAttributesQuery as gqlTypes.ExplorerAttributesQueryResult
        );

        jest.spyOn(gqlTypes, 'useSaveViewMutation').mockImplementation(() => [
            mockSaveViewMutation,
            {loading: false, called: false, client: {} as any, reset: jest.fn()}
        ]);
    });

    test('should be able to open panel and navigate inside to advanced setting and go back', async () => {
        render(
            <EditSettingsContextProvider>
                <MockViewSettingsContextProvider>
                    <MockOpenEditSettings />
                    <SidePanel />
                </MockViewSettingsContextProvider>
            </EditSettingsContextProvider>
        );

        await userEvent.click(screen.getByRole('button', {name: /settings/}));

        expect(screen.getByRole('heading', {name: /router-menu/})).toBeVisible();

        await userEvent.click(screen.getByRole('button', {name: /configure-display/}));

        expect(screen.getByText(/configure-display/)).toBeVisible();

        await userEvent.click(screen.getByRole('button', {name: /back/}));

        expect(screen.getByRole('heading', {name: /router-menu/})).toBeVisible();
    });

    describe('View type Table', () => {
        test('should be able to toggle attribute visibility', async () => {
            render(
                <EditSettingsContextProvider>
                    <MockViewSettingsContextProvider>
                        <MockOpenEditSettings />
                        <SidePanel />
                    </MockViewSettingsContextProvider>
                </EditSettingsContextProvider>
            );

            await userEvent.click(screen.getByRole('button', {name: /settings/}));
            await userEvent.click(screen.getByRole('button', {name: /configure-display/}));

            const [visibleAttributesList, hiddenAttributesList] = screen.getAllByRole('list');

            expect(
                within(visibleAttributesList)
                    .getAllByRole('listitem')
                    .find(item => item.textContent === attributesList[0].label.fr)
            ).toBeUndefined();

            const [firstAttribute, secondAttribute] = within(hiddenAttributesList).getAllByRole('listitem');

            expect(firstAttribute).toHaveTextContent(attributesList[0].label.fr);
            expect(firstAttribute).toBeVisible();
            expect(secondAttribute).toHaveTextContent(attributesList[1].label.fr);
            expect(secondAttribute).toBeVisible();

            await userEvent.click(within(firstAttribute!).getByRole('button', {name: /show/}));

            const [_ignoredWhoAmI, firstAttributeVisible] = within(visibleAttributesList).getAllByRole('listitem');
            expect(firstAttributeVisible).toBeVisible();
            expect(firstAttributeVisible).toHaveTextContent(attributesList[0].label.fr);

            expect(
                within(hiddenAttributesList)
                    .getAllByRole('listitem')
                    .find(item => item.textContent === attributesList[0].label.fr)
            ).toBeUndefined();

            await userEvent.click(within(firstAttributeVisible).getByRole('button', {name: /hide/}));

            const [firstHiddenAttribute] = within(hiddenAttributesList).getAllByRole('listitem');
            expect(firstHiddenAttribute).toBeVisible();
            expect(firstHiddenAttribute).toHaveTextContent(attributesList[0].label.fr);
        });
    });

    describe('Sort data', () => {
        test('should be able to toggle sort activation', async () => {
            render(
                <EditSettingsContextProvider>
                    <MockViewSettingsContextProvider>
                        <MockOpenEditSettings />
                        <SidePanel />
                    </MockViewSettingsContextProvider>
                </EditSettingsContextProvider>
            );

            await userEvent.click(screen.getByRole('button', {name: /settings/}));
            await userEvent.click(screen.getByRole('button', {name: /sort-items/}));

            const inactiveSorts = screen.getByRole('list', {name: /inactive/});

            const [firstAttribute, secondAttribute] = within(inactiveSorts).getAllByRole('listitem');

            expect(firstAttribute).toHaveTextContent(attributesList[0].label.fr);
            expect(firstAttribute).toBeVisible();
            expect(secondAttribute).toHaveTextContent(attributesList[1].label.fr);
            expect(secondAttribute).toBeVisible();

            await userEvent.click(within(firstAttribute!).getByRole('button', {name: /show/}));

            const activeSorts = screen.getByRole('list', {name: 'explorer.sort-list.active'});

            const firstActiveSort = within(activeSorts).getByRole('listitem');

            expect(firstActiveSort).toHaveTextContent(attributesList[0].label.fr);
            expect(firstActiveSort).toBeVisible();
            await userEvent.hover(within(firstActiveSort).getByText('1'));
            await waitFor(() => {
                const tooltip = screen.getByRole('tooltip');
                expect(tooltip).toBeVisible();
                expect(tooltip).toHaveTextContent(/ascending/);
            });

            await userEvent.click(within(firstActiveSort!).getByRole('button', {name: /hide/}));

            const [firstInactiveAttribute] = within(inactiveSorts).getAllByRole('listitem');

            expect(firstInactiveAttribute).toHaveTextContent(attributesList[0].label.fr);
            expect(firstInactiveAttribute).toBeVisible();
        });

        test('should be able to search attributes with special characters', async () => {
            const timeout = r => setTimeout(r, 350);

            render(
                <EditSettingsContextProvider panelElement={() => document.body}>
                    <MockViewSettingsContextProvider>
                        <MockOpenEditSettings />
                        <SidePanel />
                    </MockViewSettingsContextProvider>
                </EditSettingsContextProvider>
            );

            await userEvent.click(screen.getByRole('button', {name: /settings/}));
            await userEvent.click(screen.getByRole('button', {name: /sort-items/}));

            const inactiveSorts = screen.getByRole('list', {name: /inactive/});
            const searchInput = screen.getByRole('textbox');

            await act(async () => {
                // search german text with special chars
                await userEvent.type(searchInput, 'konig{Enter}');
                await new Promise(timeout);
            });
            const germanAttributes = within(inactiveSorts).getAllByRole('listitem');
            expect(germanAttributes).toHaveLength(1);
            // sort chip only display 20 first characters
            expect(germanAttributes[0]).toHaveTextContent(attributesList[2].label.fr.slice(0, 19));
            expect(germanAttributes[0]).toBeVisible();
            let clearButton = screen.getByLabelText('clear');
            await userEvent.click(clearButton);

            // search polish text with special chars
            await act(async () => {
                await userEvent.type(searchInput, 'sie{Enter}');
                await new Promise(timeout);
            });
            const polishAttributes = within(inactiveSorts).getAllByRole('listitem');
            await waitFor(() => expect(polishAttributes).toHaveLength(1));
            expect(polishAttributes[0]).toHaveTextContent(attributesList[3].label.fr.slice(0, 19));
            expect(polishAttributes[0]).toBeVisible();
            clearButton = screen.getByLabelText('clear');
            await userEvent.click(clearButton);

            // search french text with special chars
            await act(async () => {
                await userEvent.type(searchInput, 'noel{Enter}');
                await new Promise(timeout);
            });
            const frenchAttributes = within(inactiveSorts).getAllByRole('listitem');
            await waitFor(() => expect(frenchAttributes).toHaveLength(1));
            expect(frenchAttributes[0]).toHaveTextContent(attributesList[4].label.fr.slice(0, 19));
            expect(frenchAttributes[0]).toBeVisible();
            clearButton = screen.getByLabelText('clear');
            await userEvent.click(clearButton);
        });
    });

    describe('Filter data', () => {
        test('should be able to toggle filter activation', async () => {
            render(
                <EditSettingsContextProvider>
                    <MockViewSettingsContextProvider>
                        <MockOpenEditSettings />
                        <SidePanel />
                    </MockViewSettingsContextProvider>
                </EditSettingsContextProvider>
            );

            await userEvent.click(screen.getByRole('button', {name: /settings/}));
            await userEvent.click(screen.getByRole('button', {name: /filters/}));

            const inactiveFilters = screen.getByRole('list', {name: /inactive/});

            const [firstAttribute] = within(inactiveFilters).getAllByRole('listitem');

            expect(firstAttribute).toHaveTextContent(attributesList[0].label.fr);
            expect(firstAttribute).toBeVisible();

            await userEvent.click(within(firstAttribute!).getByRole('button', {name: /show/}));

            const activeFilters = screen.getByRole('list', {name: 'explorer.filter-list.active'});

            const firstActiveFilter = within(activeFilters).getByRole('listitem');

            expect(firstActiveFilter).toHaveTextContent(attributesList[0].label.fr);
            expect(firstActiveFilter).toBeVisible();

            await userEvent.click(within(firstActiveFilter!).getByRole('button', {name: /hide/}));

            const [firstInactiveAttribute] = within(inactiveFilters).getAllByRole('listitem');

            expect(firstInactiveAttribute).toHaveTextContent(attributesList[0].label.fr);
            expect(firstInactiveAttribute).toBeVisible();
        });
    });

    describe('Views', () => {
        test('Should be able to update view', async () => {
            render(
                <EditSettingsContextProvider>
                    <MockViewSettingsContextProvider>
                        <MockOpenEditSettings />
                        <SidePanel />
                    </MockViewSettingsContextProvider>
                </EditSettingsContextProvider>
            );

            await userEvent.click(screen.getByRole('button', {name: /settings/}));

            await userEvent.click(screen.getByRole('link', {name: 'global.save'}));

            expect(mockSaveViewMutation).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: {
                        view: {
                            attributes: [],
                            display: {type: 'list'},
                            filters: [],
                            id: '42',
                            label: {en: 'My view'},
                            library: 'my_lib',
                            shared: false,
                            sort: []
                        }
                    }
                })
            );
        });

        test('Should be able to save view as', async () => {
            render(
                <EditSettingsContextProvider>
                    <MockViewSettingsContextProvider>
                        <MockOpenEditSettings />
                        <SidePanel />
                    </MockViewSettingsContextProvider>
                </EditSettingsContextProvider>
            );
            mockSaveViewMutation.mockClear();

            await userEvent.click(screen.getByRole('button', {name: /settings/}));

            await userEvent.click(screen.getByRole('link', {name: /save-view-as/}));
            // hidden: true car l'ouverture de la Modal met un aria-label: hidden sur le body
            const closeButton = screen.getByRole('button', {name: 'global.close', hidden: true});
            expect(closeButton).toBeVisible();
            await userEvent.click(closeButton);
            expect(closeButton).not.toBeVisible();
            expect(mockSaveViewMutation).not.toHaveBeenCalled();

            await userEvent.click(screen.getByRole('link', {name: /save-view-as/}));
            const saveButton = screen.getByRole('button', {name: 'global.save', hidden: true});
            expect(saveButton).toBeVisible();
            await userEvent.click(saveButton);
            expect(mockSaveViewMutation).not.toHaveBeenCalled();
            await waitFor(() => expect(screen.getByText('errors.standard_field_required')).toBeVisible());

            const [requiredInput] = screen
                .getAllByRole('textbox', {hidden: true})
                .filter(r => r.getAttribute('aria-required') === 'true');

            await userEvent.type(requiredInput, 'Nom de ma vue requis{Enter}');

            // Timeout for secureClick
            await userEvent.click(saveButton, {delay: 1000});

            expect(mockSaveViewMutation).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: {
                        view: {
                            attributes: [],
                            display: {type: 'list'},
                            filters: [],
                            label: {fr: 'Nom de ma vue requis', en: 'My view'},
                            library: 'my_lib',
                            shared: false,
                            sort: []
                        }
                    }
                })
            );
        });

        test('Should be able to load user view', async () => {
            getViewsListSpy.mockReturnValueOnce(mockViewsResultWithSort as gqlTypes.GetViewsListQueryResult);

            render(
                <EditSettingsContextProvider>
                    <MockViewSettingsContextProvider>
                        <MockOpenEditSettings />
                        <SidePanel />
                    </MockViewSettingsContextProvider>
                </EditSettingsContextProvider>
            );

            await userEvent.click(screen.getByRole('button', {name: /settings/}));
            await userEvent.click(screen.getByRole('button', {name: /sort-items/}));

            const activeSorts = screen.getByRole('list', {name: 'explorer.sort-list.active'});
            expect(within(activeSorts).getAllByRole('listitem')).toHaveLength(1);
        });

        test('Should be able to reset settings to loaded view', async () => {
            getViewsListSpy.mockReturnValueOnce(mockViewsResultWithSort as gqlTypes.GetViewsListQueryResult);

            render(
                <EditSettingsContextProvider>
                    <MockViewSettingsContextProvider>
                        <MockOpenEditSettings />
                        <SidePanel />
                    </MockViewSettingsContextProvider>
                </EditSettingsContextProvider>
            );

            await userEvent.click(screen.getByRole('button', {name: /settings/}));
            await userEvent.click(screen.getByRole('button', {name: /sort-items/}));

            let activeSorts = screen.getByRole('list', {name: 'explorer.sort-list.active'});

            expect(within(activeSorts).getAllByRole('listitem')).toHaveLength(1);
            const inactiveSorts = screen.getByRole('list', {name: /inactive/});

            const [firstInactiveAttribute] = within(inactiveSorts).getAllByRole('listitem');

            await userEvent.click(within(firstInactiveAttribute!).getByRole('button', {name: /show/}));

            expect(within(activeSorts).getAllByRole('listitem')).toHaveLength(2);

            await userEvent.click(screen.getByRole('button', {name: /back/}));
            await userEvent.click(screen.getByRole('link', {name: /reinit/}));

            await userEvent.click(screen.getByRole('button', {name: /sort-items/}));
            activeSorts = screen.getByRole('list', {name: 'explorer.sort-list.active'});
            expect(within(activeSorts).getAllByRole('listitem')).toHaveLength(1);
        });

        test('Should display views list', async () => {
            const mockViewsListResult: Mockify<typeof gqlTypes.useGetViewsListQuery> = {
                data: {
                    views: {
                        list: [
                            {
                                id: '42',
                                shared: false,
                                display: {
                                    type: gqlTypes.ViewTypes.list
                                },
                                created_by: {
                                    id: '1',
                                    whoAmI: {
                                        id: '1',
                                        label: 'Admin',
                                        library: {
                                            id: 'users'
                                        }
                                    }
                                },
                                label: {en: 'My view'},
                                filters: [],
                                sort: []
                            },
                            {
                                id: '43',
                                shared: false,
                                display: {
                                    type: gqlTypes.ViewTypes.list
                                },
                                created_by: {
                                    id: '1',
                                    whoAmI: {
                                        id: '1',
                                        label: 'Admin',
                                        library: {
                                            id: 'users'
                                        }
                                    }
                                },
                                label: {en: 'My second view'},
                                filters: [],
                                sort: []
                            },
                            {
                                id: '44',
                                shared: false,
                                display: {
                                    type: gqlTypes.ViewTypes.list
                                },
                                created_by: {
                                    id: '1',
                                    whoAmI: {
                                        id: '1',
                                        label: 'Admin',
                                        library: {
                                            id: 'users'
                                        }
                                    }
                                },
                                label: {en: 'My third view'},
                                filters: [],
                                sort: []
                            }
                        ]
                    }
                },
                loading: false,
                called: true
            };
            getViewsListSpy.mockReturnValue(mockViewsListResult as gqlTypes.GetViewsListQueryResult);

            render(
                <EditSettingsContextProvider>
                    <MockViewSettingsContextProvider>
                        <MockOpenEditSettings />
                        <SidePanel />
                    </MockViewSettingsContextProvider>
                </EditSettingsContextProvider>
            );

            await userEvent.click(screen.getByRole('button', {name: /manage-views/}));

            const viewsList = screen.getByRole('list', {name: /explorer.my-views/});
            expect(within(viewsList).getAllByRole('listitem')).toHaveLength(4);
        });
    });
});
