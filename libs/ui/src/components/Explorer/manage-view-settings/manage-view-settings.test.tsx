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
import {useOpenSettings} from './open-view-settings/useOpenSettings';
import {ViewSettingsContext} from './store-view-settings/ViewSettingsContext';
import {IViewSettingsState} from './store-view-settings/viewSettingsReducer';
import {viewSettingsInitialState} from './store-view-settings/viewSettingsInitialState';

const MockOpenEditSettings: FunctionComponent = () => {
    const OpenEditSettingsButton = useOpenSettings('');

    return <>{OpenEditSettingsButton}</>;
};

const mockDispatch = jest.fn();

const MockViewSettingsContextProvider: FunctionComponent<{view?: IViewSettingsState}> = ({view, children}) => (
    <ViewSettingsContext.Provider value={{view: view ?? viewSettingsInitialState, dispatch: mockDispatch}}>
        {children}
    </ViewSettingsContext.Provider>
);

describe('Integration tests about managing view settings feature', () => {
    const attributesList = [
        {...mockAttributeSimple, id: 'simple_attribute', label: {fr: 'Attribut simple'}},
        {...mockAttributeLink, id: 'link_attribute', label: {fr: 'Attribut lien'}}
    ];
    const mockAttributesByLibResult: Mockify<typeof gqlTypes.useGetAttributesByLibQuery> = {
        data: {attributes: {list: attributesList}},
        loading: false,
        called: true
    };

    beforeAll(() => {
        jest.spyOn(gqlTypes, 'useGetAttributesByLibQuery').mockReturnValue(
            mockAttributesByLibResult as gqlTypes.GetAttributesByLibQueryResult
        );
    });

    beforeEach(() => {
        mockDispatch.mockClear();
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

        await userEvent.click(screen.getByRole('button', {name: 'explorer.settings'}));

        expect(screen.getByRole('heading', {name: 'explorer.router-menu'})).toBeVisible();

        await userEvent.click(screen.getByRole('button', {name: 'explorer.configure-display'}));

        expect(screen.getByText('explorer.configure-display')).toBeVisible();

        await userEvent.click(screen.getByRole('button', {name: 'explorer.back'}));

        expect(screen.getByRole('heading', {name: 'explorer.router-menu'})).toBeVisible();
    });

    describe('View type Table', () => {
        test('should be able to select hidden columns', async () => {
            render(
                <EditSettingsContextProvider>
                    <MockViewSettingsContextProvider view={{viewType: 'table', fields: []}}>
                        <MockOpenEditSettings />
                        <SidePanel />
                    </MockViewSettingsContextProvider>
                </EditSettingsContextProvider>
            );

            await userEvent.click(screen.getByRole('button', {name: 'explorer.settings'}));
            await userEvent.click(screen.getByRole('button', {name: 'explorer.configure-display'}));

            const [visibleFieldsList, hiddenFieldsList] = screen.getAllByRole('list');

            expect(
                within(visibleFieldsList)
                    .getAllByRole('listitem')
                    .find(item => item.textContent === attributesList[0].label.fr)
            ).toBeUndefined();

            const [firstAttribute, secondAttribute] = within(hiddenFieldsList).getAllByRole('listitem');

            expect(firstAttribute).toHaveTextContent(attributesList[0].label.fr);
            expect(firstAttribute).toBeVisible();
            expect(secondAttribute).toHaveTextContent(attributesList[1].label.fr);
            expect(secondAttribute).toBeVisible();

            await userEvent.click(within(firstAttribute!).getByRole('button', {name: /show/}));

            expect(mockDispatch).toHaveBeenCalledTimes(1);
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'ADD_FIELD',
                payload: {
                    field: 'simple_attribute'
                }
            });
        });

        test('should be able to select visible columns', async () => {
            render(
                <EditSettingsContextProvider>
                    <MockViewSettingsContextProvider view={{viewType: 'table', fields: ['simple_attribute']}}>
                        <MockOpenEditSettings />
                        <SidePanel />
                    </MockViewSettingsContextProvider>
                </EditSettingsContextProvider>
            );

            await userEvent.click(screen.getByRole('button', {name: 'explorer.settings'}));
            await userEvent.click(screen.getByRole('button', {name: 'explorer.configure-display'}));

            const [visibleFieldsList, hiddenFieldsList] = screen.getAllByRole('list');

            const [_ignoredWhoAmI, firstAttributeVisible] = within(visibleFieldsList).getAllByRole('listitem');
            expect(firstAttributeVisible).toBeVisible();
            expect(firstAttributeVisible).toHaveTextContent(attributesList[0].label.fr);

            expect(
                within(hiddenFieldsList)
                    .getAllByRole('listitem')
                    .find(item => item.textContent === attributesList[0].label.fr)
            ).toBeUndefined();

            await userEvent.click(within(firstAttributeVisible).getByRole('button', {name: /hide/}));

            expect(mockDispatch).toHaveBeenCalledTimes(1);
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'REMOVE_FIELD',
                payload: {
                    field: 'simple_attribute'
                }
            });
        });
    });
});
