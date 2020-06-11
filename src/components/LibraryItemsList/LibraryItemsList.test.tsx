import {mount, render} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import Filters from './Filters';
import LibraryItemsList from './LibraryItemsList';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libId: 'test', libQueryName: 'test'})),
    useHistory: jest.fn()
}));

describe('LibraryItemsList', () => {
    const libQueryName = 'test';
    const pagination = 20;
    const offset = 0;

    const mocks = [
        {
            request: {
                query: getRecordsFromLibraryQuery(libQueryName, pagination, offset),
                variables: {
                    filters: null
                }
            },
            result: {
                data: {
                    [libQueryName]: {
                        __typename: libQueryName,
                        totalCount: 1
                    },
                    libraries: {
                        __typename: libQueryName,
                        list: [
                            {
                                __typename: libQueryName,
                                id: '31662',
                                whoAmI: {
                                    __typename: 'RecordIdentity',
                                    id: '31662',
                                    label: 'test',
                                    preview: null,
                                    library: {__typename: 'Library', id: 'test', label: {fr: 'test'}}
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
                <LibraryItemsList />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });

    test('should call have filter panel', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <LibraryItemsList />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Filters)).toHaveLength(1);
    });
});
