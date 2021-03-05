// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '@testing-library/react';
import {getFormQuery} from 'queries/forms/getFormQuery';
import React from 'react';
import {mockForm} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import EditRecord from './EditRecord';

jest.mock('./EditRecordForm', () => {
    return function EditRecordForm() {
        return <div>EditRecordForm</div>;
    };
});

describe('EditRecord', () => {
    test('Render form after loading', async () => {
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
                <EditRecord record={mockRecordWhoAmI} />
            </MockedProviderWithFragments>
        );

        await act(async () => {
            expect(screen.getAllByTestId('edit-record-skeleton').length).toBeGreaterThan(0);
        });

        expect(screen.getByText('EditRecordForm')).toBeInTheDocument();
    });
});
