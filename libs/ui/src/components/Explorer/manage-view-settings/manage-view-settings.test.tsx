// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useReducer} from 'react';
import {render, screen, within} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import {Mockify} from '@leav/utils';
import {mockAttributeLink, mockAttributeSimple} from '_ui/__mocks__/common/attribute';
import * as gqlTypes from '_ui/_gqlTypes';
import {EditSettingsContextProvider} from './open-view-settings/EditSettingsContextProvider';
import {SidePanel} from './open-view-settings/SidePanel';
import {useOpenViewSettings} from './open-view-settings/useOpenViewSettings';
import {ViewSettingsContext} from './store-view-settings/ViewSettingsContext';
import {IViewSettingsState, viewSettingsReducer} from './store-view-settings/viewSettingsReducer';
import {viewSettingsInitialState} from './store-view-settings/viewSettingsInitialState';
import {waitFor} from '@testing-library/react';

const MockOpenEditSettings: FunctionComponent = () => {
    const {viewSettingsButton} = useOpenViewSettings('', 20);

    return <>{viewSettingsButton}</>;
};

const MockViewSettingsContextProvider: FunctionComponent<{viewMock: IViewSettingsState}> = ({viewMock, children}) => {
    const [view, dispatch] = useReducer(viewSettingsReducer, viewMock);
    return <ViewSettingsContext.Provider value={{view, dispatch}}>{children}</ViewSettingsContext.Provider>;
};

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

    test('should be able to open panel and navigate inside to advanced setting and go back', async () => {
        render(
            <EditSettingsContextProvider>
                <MockViewSettingsContextProvider viewMock={viewSettingsInitialState}>
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
                    <MockViewSettingsContextProvider viewMock={viewSettingsInitialState}>
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
                    <MockViewSettingsContextProvider viewMock={viewSettingsInitialState}>
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
    });
});
