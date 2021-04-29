// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
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

    test('should call ColumnNavigation', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockStore>
                    <MockedProviderWithFragments mocks={mocks} addTypename>
                        <NavigationView />
                    </MockedProviderWithFragments>
                </MockStore>
            );

            await wait();

            await comp.update();
        });

        expect(comp.find('ColumnNavigation')).toHaveLength(1);
    });
});
