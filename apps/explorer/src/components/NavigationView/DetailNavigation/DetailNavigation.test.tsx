// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {navigationInitialState} from 'redux/navigation';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {mockTreeNodePermissions, mockTreeRecord} from '__mocks__/common/treeElements';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import DetailNavigation from './DetailNavigation';

jest.mock(
    '../../shared/RecordPreview',
    () =>
        function RecordPreview() {
            return <div>RecordPreview</div>;
        }
);

describe('DetailNavigation', () => {
    test('should display preview', async () => {
        const mockState = {
            navigation: {
                ...navigationInitialState,
                recordDetail: {id: '12345', record: mockTreeRecord, permissions: mockTreeNodePermissions, children: []}
            }
        };

        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore state={mockState}>
                        <DetailNavigation />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(await waitForElement(() => screen.getByText('RecordPreview'))).toBeInTheDocument();
    });
});
