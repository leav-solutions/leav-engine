// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {getLibrariesListQuery} from '../../graphQL/queries/libraries/getLibrariesListQuery';
import {getUserDataQuery} from '../../graphQL/queries/userData/getUserData';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import LibrariesList, {FAVORITE_LIBRARIES_KEY} from './LibrariesList';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({})),
    useHistory: jest.fn(),
    NavLink: jest.fn(() => <></>)
}));

jest.mock(
    './LibraryCard',
    () =>
        function LibraryCard() {
            return <div>LibraryCard</div>;
        }
);

describe('LibrariesList', () => {
    const mocks = [
        {
            request: {
                query: getLibrariesListQuery
            },
            result: {
                data: {
                    libraries: {
                        __typename: 'LibrariesList',
                        list: [
                            {
                                __typename: 'Library',
                                id: 'test',
                                system: false,
                                label: {},
                                gqlNames: {
                                    __typename: 'Test',
                                    query: 'test',
                                    filter: 'TestFilter',
                                    searchableFields: 'TestSearch'
                                },
                                attributes: {
                                    __typename: 'Attribute',
                                    id: 'string',
                                    type: 'string',
                                    format: 'string',
                                    label: {}
                                }
                            }
                        ]
                    }
                }
            }
        },
        {
            request: {
                query: getUserDataQuery,
                variables: {keys: [FAVORITE_LIBRARIES_KEY]}
            },
            result: {
                data: {
                    userData: {
                        __typename: 'UserData',
                        global: false,
                        data: {FAVORITE_LIBRARIES_KEY: []}
                    }
                }
            }
        }
    ];

    test('should call LibraryCard', async () => {
        await act(async () => {
            render(
                <MockStore>
                    <MockedProviderWithFragments mocks={mocks}>
                        <LibrariesList />
                    </MockedProviderWithFragments>
                </MockStore>
            );
        });

        expect(await waitForElement(() => screen.getByText('LibraryCard'))).toBeInTheDocument();
    });
});
