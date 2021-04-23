// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockFilter} from '__mocks__/common/filter';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import ChangeAttribute from './ChangeAttribute';

jest.mock('../../../AttributesSelectionList', () => {
    return function AttributesSelectionList() {
        return <div>AttributesSelectionList</div>;
    };
});

describe('ChangeAttribute', () => {
    test('should list attribute', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <ChangeAttribute filter={mockFilter} showModal={true} setShowModal={jest.fn()} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        const element = await waitForElement(async () => screen.getByText('AttributesSelectionList'));

        expect(element).toBeInTheDocument();
    });
});
