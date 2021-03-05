// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '@testing-library/react';
import {getFormQuery} from 'queries/forms/getFormQuery';
import {getRecordDependenciesValuesQuery} from 'queries/forms/getRecordDependenciesValuesQuery';
import React from 'react';
import {GET_FORM_forms_list} from '_gqlTypes/GET_FORM';
import {mockForm} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import EditRecordForm from './EditRecordForm';

describe('EditRecordForm', () => {
    test('Render form immediately if no dependencies', async () => {
        const mocks = [
            {
                request: {
                    query: getFormQuery,
                    variables: {
                        library: mockRecordWhoAmI.library.id,
                        formId: 'edition'
                    }
                },
                result: {
                    data: {
                        forms: {
                            __typename: 'FormList',
                            totalCount: 0,
                            list: [
                                {
                                    __typename: 'Form',
                                    ...mockForm
                                }
                            ]
                        }
                    }
                }
            }
        ];

        render(
            <MockedProviderWithFragments mocks={mocks}>
                <EditRecordForm form={mockForm} record={mockRecordWhoAmI} />
            </MockedProviderWithFragments>
        );

        expect(screen.getByTestId('container-child-element')).toBeInTheDocument();
    });

    test('Render form after loading dependencies values', async () => {
        const mockFormWithDeps: GET_FORM_forms_list = {
            ...mockForm,
            dependencyAttributes: [
                {
                    id: 'dep_attribute1',
                    label: null
                }
            ]
        };

        const query = getRecordDependenciesValuesQuery(mockRecordWhoAmI.library.gqlNames.query, ['dep_attribute1']);
        const mocks = [
            {
                request: {
                    query,
                    variables: {
                        id: mockRecordWhoAmI.id
                    }
                },
                result: {
                    data: {
                        [mockRecordWhoAmI.library.gqlNames.query]: {
                            totalCount: 1,
                            list: [
                                {
                                    dep_attribute1: {id: '123', library: 'tree_lib'}
                                }
                            ]
                        }
                    }
                }
            }
        ];

        render(
            <MockedProviderWithFragments mocks={mocks}>
                <EditRecordForm form={mockFormWithDeps} record={mockRecordWhoAmI} />
            </MockedProviderWithFragments>
        );

        await act(async () => {
            expect(screen.getAllByTestId('edit-record-skeleton').length).toBeGreaterThan(0);
        });

        expect(screen.getByTestId('container-child-element')).toBeInTheDocument();
    });
});
