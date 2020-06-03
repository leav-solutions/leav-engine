import {wait} from '@apollo/react-testing';
import {mount, render} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getLibrariesListQuery} from '../../queries/libraries/getLibrariesListQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import LibrariesList from './LibrariesList';
import LibraryCard from './LibraryCard';
import LibraryDetail from './LibraryDetail';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({})),
    useHistory: jest.fn(),
    NavLink: jest.fn(() => <></>)
}));

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
                                    query: 'test'
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
        }
    ];
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments mocks={mocks}>
                <LibrariesList />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });

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
            await wait(0);
            comp.update();
        });

        expect(comp.find(LibraryCard)).toHaveLength(1);
    });

    test("shouldn't call LibraryCard", async () => {
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
            // wait 0 isn't enough, it fail sometimes
            await wait(2);
            comp.update();
        });

        expect(comp.find(LibraryDetail)).toHaveLength(0);
    });
});
