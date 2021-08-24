// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import MenuItemList from './MenuItemList';

jest.mock(
    '../MenuView',
    () =>
        function MenuView() {
            return <div>MenuView</div>;
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
    test('should have MenuView', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <MenuItemList refetch={jest.fn()} />
                    </MockStore>
                </MockedProviderWithFragments>
            );

            await waitForElement(() => screen.getByText('MenuView'));

            const menuViewMockContent = screen.getByText('MenuView');

            expect(menuViewMockContent).toBeInTheDocument();
        });
    });

    test('should have button show filter', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <MenuItemList refetch={jest.fn()} />
                    </MockStore>
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
                    <MockStore>
                        <MenuItemList refetch={jest.fn()} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('MenuItemActions')).toHaveLength(1);
    });
});
