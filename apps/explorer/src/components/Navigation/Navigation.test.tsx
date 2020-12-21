// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getTreeListQuery} from '../../queries/trees/getTreeListQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import Navigation from './Navigation';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({treeId: 'TreeId'}))
}));

jest.mock(
    '../NavigationView',
    () =>
        function NavigationView() {
            return <div>NavigationView</div>;
        }
);

describe('Navigation', () => {
    const mocks = [
        {
            request: {
                query: getTreeListQuery,
                variables: {
                    treeId: 'TreeId'
                }
            },
            result: {
                data: {
                    trees: {
                        list: [
                            {
                                id: 'idTree',
                                label: {fr: 'labelTree', en: 'labelTree'},
                                libraries: [
                                    {
                                        id: 'idLib',
                                        label: {fr: 'labelLib', en: 'labelLib'}
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        }
    ];
    test('should call NavigationView', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename={true}>
                    <Navigation />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('NavigationView')).toHaveLength(1);
    });
});
