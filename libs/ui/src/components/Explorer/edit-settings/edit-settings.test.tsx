// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, within} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import {FunctionComponent} from 'react';
import {EditSettingsContextProvider} from './EditSettingsContextProvider';
import {SidePanel} from './SidePanel';
import {useOpenSettings} from './useOpenSettings';
import {mockAttributeLink, mockAttributeSimple} from '_ui/__mocks__/common/attribute';
import {Mockify} from '@leav/utils';
import * as gqlTypes from '_ui/_gqlTypes';
import {ViewSettingsContextProvider} from './ViewSetingsContextProvider';

const MockOpenEditSettings: FunctionComponent = () => {
    const OpenEditSettingsButton = useOpenSettings('');

    return <>{OpenEditSettingsButton}</>;
};

describe('Integration tests about edit settings feature', () => {
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
                <MockOpenEditSettings />
                <SidePanel />
            </EditSettingsContextProvider>
        );

        await userEvent.click(screen.getByRole('button', {name: 'explorer.settings'}));

        expect(screen.getByRole('heading', {name: 'explorer.view-configuration'})).toBeVisible();

        await userEvent.click(screen.getByRole('button', {name: 'explorer.display-mode'}));

        expect(screen.getByText('explorer.display-mode')).toBeVisible();

        await userEvent.click(screen.getByRole('button', {name: 'explorer.back'}));

        expect(screen.getByRole('heading', {name: 'explorer.view-configuration'})).toBeVisible();
    });

    describe('Display mode Table', () => {
        test('should be able to select visible/hidden columns', async () => {
            render(
                <EditSettingsContextProvider>
                    <ViewSettingsContextProvider>
                        <MockOpenEditSettings />
                        <SidePanel />
                    </ViewSettingsContextProvider>
                </EditSettingsContextProvider>
            );

            await userEvent.click(screen.getByRole('button', {name: 'explorer.settings'}));
            await userEvent.click(screen.getByRole('button', {name: 'explorer.display-mode'}));

            const [visibleFieldsList, hiddenFieldsList] = screen.getAllByRole('list');

            const [firstAttribute, secondAttribute] = within(hiddenFieldsList).getAllByRole('listitem');

            expect(firstAttribute).toHaveTextContent(attributesList[0].label.fr);
            expect(firstAttribute).toBeVisible();
            expect(secondAttribute).toHaveTextContent(attributesList[1].label.fr);
            expect(secondAttribute).toBeVisible();

            await userEvent.click(within(firstAttribute!).getByRole('button', {name: /show/}));

            const [_ignoredWhoAmI, firstAttributeVisible] = within(visibleFieldsList).getAllByRole('listitem');
            expect(firstAttributeVisible).toBeVisible();
            expect(firstAttributeVisible).toHaveTextContent(attributesList[0].label.fr);

            expect(
                within(hiddenFieldsList)
                    .getAllByRole('listitem')
                    .find(item => item.textContent === attributesList[0].label.fr)
            ).toBeUndefined();

            await userEvent.click(within(firstAttributeVisible).getByRole('button', {name: /hide/}));

            expect(
                within(hiddenFieldsList)
                    .getAllByRole('listitem')
                    .find(item => item.textContent === attributesList[0].label.fr)
            ).toBeVisible();

            expect(
                within(visibleFieldsList)
                    .getAllByRole('listitem')
                    .find(item => item.textContent === attributesList[0].label.fr)
            ).toBeUndefined();
        });
    });
});
