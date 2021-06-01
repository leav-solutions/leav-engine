// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {getTreeListQuery} from '../../graphQL/queries/trees/getTreeListQuery';
import {getUserDataQuery} from '../../queries/userData/getUserData';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import TreeList, {FAVORITE_TREES_KEY} from './TreeList';

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
                                        library: {
                                            id: 'idLib',
                                            label: {fr: 'labelLib', en: 'labelLib'}
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        },
        {
            request: {
                query: getUserDataQuery,
                variables: {key: FAVORITE_TREES_KEY}
            },
            result: {
                data: {
                    userData: {
                        __typename: 'UserData',
                        global: false,
                        data: []
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
                    <MockStore>
                        <TreeList />
                    </MockStore>
                </MockedProviderWithFragments>
            );

            await wait();

            comp.update();
        });

        expect(comp.text()).toContain('TreeItem');
    });
});
