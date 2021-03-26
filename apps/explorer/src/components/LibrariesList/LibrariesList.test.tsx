// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import {getLibrariesListQuery} from '../../graphQL/queries/libraries/getLibrariesListQuery';
import {getUserDataQuery} from '../../queries/userData/getUserData';
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

jest.mock(
    './LibraryDetail',
    () =>
        function LibraryDetail() {
            return <div>LibraryDetail</div>;
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
                variables: {key: FAVORITE_LIBRARIES_KEY}
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

    test('should call LibraryCard', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <LibrariesList />
                </MockedProviderWithFragments>
            );
        });

        await act(async () => {
            await wait(1);
            comp.update();
        });

        expect(comp.find('LibraryCard')).toHaveLength(1);
    });

    test("shouldn't call LibraryDetail", async () => {
        let comp: any;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <LibrariesList />
                </MockedProviderWithFragments>
            );
        });

        // wait for the query to respond
        await act(async () => {
            await wait(1);
            comp.update();
        });

        expect(comp.find('LibraryDetail')).toHaveLength(0);
    });
});
