import {wait} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import {mockLibrary} from '../../../__mocks__/libraries';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import EditRecord from './EditRecord';

jest.mock(
    './EditRecordForm',
    () =>
        function RecordEditionForm() {
            return <div>Edit form container</div>;
        }
);

describe('EditRecord', () => {
    test('Loading and success state', async () => {
        const mocks = [
            {
                request: {
                    query: getLibsQuery,
                    variables: {id: 'products'}
                },
                result: {
                    data: {
                        libraries: {
                            __typename: 'LibrariesList',
                            totalCount: 1,
                            list: [
                                {
                                    ...mockLibrary
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
                <MockedProviderWithFragments mocks={mocks} addTypename>
                    <EditRecord library="products" recordId="12345" />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        const formContainer = comp.find('RecordEditionForm');
        expect(formContainer).toHaveLength(1);
        const attributes = formContainer.prop('library').attributes;
        expect(attributes).toHaveLength(2);
    });

    test('Error state', async () => {
        const mocks = [
            {
                request: {
                    query: getLibsQuery,
                    variables: {id: 'products'}
                },
                error: new Error('Boom!')
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename>
                    <EditRecord library="products" recordId="12345" />
                </MockedProviderWithFragments>
            );
        });

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('.error')).toHaveLength(1);
    });

    test('Retrieve label updates', async () => {
        const mocks = [
            {
                request: {
                    query: getLibsQuery,
                    variables: {id: 'products'}
                },
                result: {
                    data: {
                        libraries: {
                            __typename: 'LibrariesList',
                            totalCount: 1,
                            list: [
                                {
                                    ...mockLibrary
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const onLabelUpdate = jest.fn();

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename>
                    <EditRecord library="products" recordId="12345" onIdentityUpdate={onLabelUpdate} />
                </MockedProviderWithFragments>
            );
        });

        await act(async () => {
            await wait(0);
            comp.update();
        });

        const labelUpdateFunc = comp.find('RecordEditionForm').prop('onIdentityUpdate');

        labelUpdateFunc();

        expect(onLabelUpdate).toBeCalled();
    });
});
