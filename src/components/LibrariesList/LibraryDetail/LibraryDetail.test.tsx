import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Grid, Segment} from 'semantic-ui-react';
import wait from 'waait';
import {getLibraryDetailQuery} from '../../../queries/libraries/getLibraryDetailQuery';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import LibraryDetail from './LibraryDetail';

jest.mock('react-router-dom');

describe('LibraryDetail', () => {
    describe('test rendering', () => {
        const libId = 'test';
        const libQueryName = 'test';
        const totalCount = 1;
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
                            totalCount
                        },
                        libraries: {
                            __typename: 'LibrariesList',
                            list: [
                                {
                                    __typename: 'Library',
                                    id: 'test',
                                    system: false,
                                    label: '',
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

        let comp: any;
        test('Should display detail empty', async () => {
            await act(async () => {
                comp = mount(
                    <MockedProviderWithFragments mocks={mocks}>
                        <LibraryDetail libId={libId} libQueryName={libQueryName} />
                    </MockedProviderWithFragments>
                );
            });
            expect(comp.find(Grid)).toHaveLength(1);
            expect(comp.find(Grid.Column)).toHaveLength(3);
        });

        test('Should fill info', async () => {
            await act(async () => {
                await wait(0);
                comp.update();
            });

            expect(comp.find(Segment).first().text()).toContain(totalCount);
        });
    });
});
