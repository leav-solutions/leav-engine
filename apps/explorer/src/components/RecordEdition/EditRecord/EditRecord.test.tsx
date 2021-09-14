// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getFormQuery} from 'graphQL/queries/forms/getFormQuery';
import React from 'react';
import {act, render, screen, waitForElement} from '_tests/testUtils';
import {mockForm} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
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
            <EditRecord
                record={mockRecordWhoAmI}
                library={mockRecordWhoAmI.library.id}
                onValueDelete={jest.fn()}
                onValueSubmit={jest.fn()}
            />,
            {
                apolloMocks: mocks
            }
        );

        await act(async () => {
            expect(screen.getAllByTestId('edit-record-skeleton').length).toBeGreaterThan(0);
        });

        await waitForElement(() => screen.getByText('EditRecordForm'));

        expect(screen.getByText('EditRecordForm')).toBeInTheDocument();
    });
});
