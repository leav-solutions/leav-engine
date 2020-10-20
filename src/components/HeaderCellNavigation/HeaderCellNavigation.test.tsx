import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getActiveTree, IGetActiveTree} from '../../queries/cache/activeTree/getActiveTreeQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {MockStateNavigation} from '../../__mocks__/Navigation/mockState';
import HeaderCellNavigation from './HeaderCellNavigation';

describe('HeaderCellNavigation', () => {
    const path = [
        {id: 'parentId', label: 'parentLabel', library: 'parentLib'},
        {id: 'childId', label: 'childLabel', library: 'childLib'}
    ];

    test('should display parent Label', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStateNavigation stateNavigation={{path}}>
                        <HeaderCellNavigation depth={2} />
                    </MockStateNavigation>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain(path[0].label);
    });

    test('should display activeTreeLabel', async () => {
        let comp: any;

        const mockActiveTree: IGetActiveTree = {
            activeTree: {
                id: 'treeId',
                label: 'treeLabel',
                libraries: [{id: 'libId'}]
            }
        };

        const mockCache = new InMemoryCache();

        mockCache.writeQuery({
            query: getActiveTree,

            data: {
                ...mockActiveTree
            }
        });

        await act(async () => {
            comp = mount(
                <MockedProvider cache={mockCache}>
                    <MockStateNavigation stateNavigation={{path}}>
                        <HeaderCellNavigation depth={1} />
                    </MockStateNavigation>
                </MockedProvider>
            );
        });

        expect(comp.text()).toContain(mockActiveTree.activeTree?.label);
    });
});
