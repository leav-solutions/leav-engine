import {mount, render} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getRecordsFromLibraryQuery} from '../../queries/records/getRecordsFromLibraryQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import Filters from './Filters';
import LibraryItemsList from './LibraryItemsList';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libId: 'test', libQueryName: 'test', filterName: 'TestFilter'})),
    useHistory: jest.fn()
}));

describe('LibraryItemsList', () => {
    const libQueryName = 'test';
    const libQueryFilter = 'TestFilter';
    const pagination = 20;
    const offset = 0;

    const mocks = [
        {
            request: {
                query: getRecordsFromLibraryQuery(libQueryName, libQueryFilter, pagination, offset),
                variables: {
                    filters: []
                }
            },
            result: {
                data: {
                    [libQueryName]: {
                        totalCount: 1
                    },
                    libraries: {
                        list: [
                            {
                                id: '31662',
                                label: libQueryFilter,
                                whoAmI: {
                                    id: '31662',
                                    label: 'test',
                                    preview: null,
                                    library: {id: 'test', label: {fr: 'test'}}
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
            <MockedProviderWithFragments mocks={mocks} addTypename={true}>
                <LibraryItemsList />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });

    test('should call have filter panel', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename={true}>
                    <LibraryItemsList />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Filters)).toHaveLength(1);
    });
});
