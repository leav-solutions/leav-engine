// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getRecordFormQuery} from 'graphQL/queries/forms/getRecordFormQuery';
import {act, render, screen, waitFor} from '_tests/testUtils';
import {mockRecordForm} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import EditRecord from './EditRecord';

jest.mock('./uiElements/StandardField', () => {
    return function StandardField() {
        return <div>StandardField</div>;
    };
});

describe('EditRecord', () => {
    test('Render form after loading', async () => {
        const mocks = [
            {
                request: {
                    query: getRecordFormQuery,
                    variables: {
                        libraryId: mockRecordWhoAmI.library.id,
                        formId: 'edition',
                        recordId: '123456',
                        version: null
                    }
                },
                result: {
                    data: {
                        recordForm: {
                            __typename: 'RecordForm',
                            id: mockRecordForm.id,
                            recordId: '123456',
                            library: mockRecordForm.library,
                            system: false,
                            elements: mockRecordForm.elements
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
                onDeleteMultipleValues={jest.fn()}
                readonly={false}
            />,
            {
                apolloMocks: mocks
            }
        );

        await act(async () => {
            expect(screen.getAllByTestId('edit-record-skeleton').length).toBeGreaterThan(0);
        });

        await waitFor(() => screen.getByTestId('container-child-element'));

        expect(screen.getByTestId('container-child-element')).toBeInTheDocument();
        expect(screen.getByText('StandardField')).toBeInTheDocument();
    });
});
