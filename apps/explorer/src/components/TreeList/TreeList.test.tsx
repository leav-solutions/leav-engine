// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import {getTreeListQuery} from '../../queries/trees/getTreeListQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import TreeList from './TreeList';

jest.mock('../TreeItem', () => {
    return function TreeItem() {
        return <div>TreeItem</div>;
    };
});

describe('TreeList', () => {
    const mocks = [
        {
            request: {
                query: getTreeListQuery
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

    test('should render TreeItem', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename>
                    <TreeList />
                </MockedProviderWithFragments>
            );

            await wait();

            comp.update();
        });

        expect(comp.text()).toContain('TreeItem');
    });
});
