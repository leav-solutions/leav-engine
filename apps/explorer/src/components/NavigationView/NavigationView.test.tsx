// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {getTreeContentQuery} from '../../graphQL/queries/trees/getTreeContentQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import NavigationView from './NavigationView';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({treeId: 'files'}))
}));

jest.mock(
    '../ColumnNavigation',
    () =>
        function ColumnNavigation() {
            return <div>ColumnNavigation</div>;
        }
);

describe('NavigationView', () => {
    test('should call ColumnNavigation', async () => {
        await act(async () => {
            const mocks = [
                {
                    request: {
                        query: getTreeContentQuery(1),
                        variables: {
                            treeId: 'files'
                        }
                    },
                    result: {
                        data: {
                            treeContent: []
                        }
                    }
                }
            ];

            render(
                <MockStore>
                    <MockedProviderWithFragments mocks={mocks} addTypename>
                        <NavigationView />
                    </MockedProviderWithFragments>
                </MockStore>
            );
        });

        expect(await waitForElement(() => screen.getByText('ColumnNavigation'))).toBeInTheDocument();
    });
});
