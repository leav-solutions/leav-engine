// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_tests/testUtils';
import {getTreeByIdQuery} from '../../../../../../../../../queries/trees/getTreeById';
import {TreeBehavior} from '../../../../../../../../../_gqlTypes/globalTypes';
import {mockInitialState} from '../formBuilderReducer/_fixtures/fixtures';
import BreadcrumbNavigator from './BreadcrumbNavigator';

jest.mock('./BreadcrumbNavigatorView', () => function BreadcrumbNavigatorView() {
        return <div>BreadcrumbNavigatorView</div>;
    });

jest.mock('../formBuilderReducer/hook/useFormBuilderReducer', () => ({
    useFormBuilderReducer: () => ({
        state: {
            ...mockInitialState,
            activeDependency: {
                attribute: 'category',
                ancestors: [],
                value: null
            }
        },
        dispatch: jest.fn()
    })
}));

describe('BreadcrumbNavigator', () => {
    test('Load tree data', async () => {
        const mocks = [
            {
                request: {
                    query: getTreeByIdQuery,
                    variables: {
                        id: ['categories']
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
                                                allowMultiplePositions: true,
                                                allowedAtRoot: true,
                                                allowedChildren: ['__all__']
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

        render(<BreadcrumbNavigator />, {apolloMocks: mocks});
        expect(await screen.findByText('BreadcrumbNavigatorView')).toBeInTheDocument();
    });
});
