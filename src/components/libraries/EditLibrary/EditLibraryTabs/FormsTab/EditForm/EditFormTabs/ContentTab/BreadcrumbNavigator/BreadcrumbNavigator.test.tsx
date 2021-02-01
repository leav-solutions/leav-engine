// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider, wait} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getTreeByIdQuery} from '../../../../../../../../../queries/trees/getTreeById';
import {TreeBehavior} from '../../../../../../../../../_gqlTypes/globalTypes';
import {initialState} from '../formBuilderReducer/_fixtures/fixtures';
import BreadcrumbNavigator from './BreadcrumbNavigator';

jest.mock('./BreadcrumbNavigatorView', () => {
    return function BreadcrumbNavigatorView() {
        return <div>BreadcrumbNavigatorView</div>;
    };
});

describe('BreadcrumbNavigator', () => {
    test('Load tree data', async () => {
        const mocks = [
            {
                request: {
                    query: getTreeByIdQuery,
                    variables: {
                        id: 'categories'
                    }
                },
                result: {
                    data: {
                        trees: {
                            __typename: 'TreesList',
                            totalCount: 1,
                            list: [
                                {
                                    __typename: 'Tree',
                                    id: 'categories',
                                    system: false,
                                    label: {
                                        en: 'Categories',
                                        fr: 'Categories'
                                    },
                                    behavior: TreeBehavior.standard,
                                    libraries: [
                                        {
                                            __typename: 'TreeLibrary',
                                            library: {
                                                id: 'test_lib',
                                                label: {fr: 'My Lib'},
                                                attributes: [],
                                                __typename: 'Library'
                                            },
                                            settings: {
                                                __typename: 'TreeLibrarySettings',
                                                allowMultiplePositions: true
                                            }
                                        }
                                    ],
                                    permissions_conf: null
                                }
                            ]
                        }
                    }
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename>
                    <BreadcrumbNavigator
                        dispatch={jest.fn()}
                        state={{
                            ...initialState,
                            activeDependency: {
                                attribute: 'category',
                                ancestors: [],
                                value: null
                            }
                        }}
                    />
                </MockedProvider>
            );
            await wait(0);
            comp.update();
        });

        expect(comp.find('BreadcrumbNavigatorView')).toHaveLength(1);
    });
});
