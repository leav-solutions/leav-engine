// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {MockStateItems} from '../../../__mocks__/stateItems/mockStateItems';
import MenuItemList from './MenuItemList';

jest.mock(
    '../SelectView',
    () =>
        function SelectView() {
            return <div>SelectView</div>;
        }
);

jest.mock('../MenuSelection', () => {
    return function MenuSelection() {
        return <div>MenuSelection</div>;
    };
});

jest.mock('../MenuItemActions', () => {
    return function MenuItemActions() {
        return <div>MenuItemActions</div>;
    };
});

jest.mock('../../../hooks/ActiveLibHook/ActiveLibHook', () => ({useActiveLibrary: () => [{id: 'test'}, jest.fn()]}));

describe('MenuItemList', () => {
    test('should have SelectView', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStateItems>
                        <MenuItemList refetch={jest.fn()} />
                    </MockStateItems>
                </MockedProviderWithFragments>
            );

            await waitForElement(() => screen.getByText('SelectView'));

            const selectViewMockContent = screen.getByText('SelectView');

            expect(selectViewMockContent).toBeInTheDocument();
        });
    });

    test('should have button show filter', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStateItems>
                        <MenuItemList refetch={jest.fn()} />
                    </MockStateItems>
                </MockedProviderWithFragments>
            );

            const showFilterButtonElement = await screen.findByRole('show-filter');

            expect(showFilterButtonElement).toBeInTheDocument();
        });
    });

    test('should have change column button', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStateItems>
                        <MenuItemList refetch={jest.fn()} />
                    </MockStateItems>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('MenuItemActions')).toHaveLength(1);
    });
});
