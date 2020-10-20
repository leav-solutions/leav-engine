import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import {getTreeContentQuery} from '../../queries/trees/getTreeContentQuery';
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
                <MockedProviderWithFragments mocks={mocks} addTypename={true}>
                    <NavigationView />
                </MockedProviderWithFragments>
            );

            await wait(5);

            await comp.update();
        });

        expect(comp.find('ColumnNavigation')).toHaveLength(1);
    });
});
