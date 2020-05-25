import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getLibraryDetailQuery} from '../../../queries/libraries/getLibraryDetailQuery';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import LibraryDetail from '../LibraryDetail/LibraryDetail';
import LibraryDetailWrapper from './LibraryDetailWrapper';

jest.mock('../LibraryDetail');
jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libId: 'test', libQueryName: 'test'})),
    useHistory: jest.fn(() => ({goBack: jest.fn()})),
    NavLink: jest.fn(() => <></>)
}));

describe('LibraryDetail', () => {
    describe('test rendering', () => {
        const libId = 'test';
        const libQueryName = 'test';

        const mocks = [
            {
                request: {
                    query: getLibraryDetailQuery(libQueryName),
                    variables: {
                        libId
                    }
                },
                result: {
                    data: {
                        [libQueryName]: {
                            __typename: 'number',
                            totalCount: 1
                        },
                        libraries: {
                            __typename: 'LibrariesList',
                            list: [
                                {
                                    __typename: 'Library',
                                    id: 'test',
                                    system: false,
                                    label: {},
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

        test('Should render LibraryDetail', async () => {
            let comp: any;
            await act(async () => {
                comp = mount(
                    <MockedProviderWithFragments mocks={mocks}>
                        <LibraryDetailWrapper />
                    </MockedProviderWithFragments>
                );
            });

            expect(comp.find(LibraryDetail)).toHaveLength(1);
        });
    });
});
