// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getRecordColumnsValues} from '_ui/_queries/records/getRecordColumnsValues';
import {fireEvent} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {IUseCanEditRecordHook} from '../../../hooks/useCanEditRecord/useCanEditRecord';
import {render, screen} from '../../../_tests/testUtils';
import EditRecordModal from './EditRecordModal';

jest.mock('../EditRecord', () => {
    return function EditRecord() {
        return <div>EditRecord</div>;
    };
});

jest.mock('hooks/useCanEditRecord/useCanEditRecord', () => ({
    useCanEditRecord: (): IUseCanEditRecordHook => ({loading: false, canEdit: true, isReadOnly: false})
}));

describe('EditRecordModal', () => {
    const commonMocks = [
        {
            request: {
                query: getRecordColumnsValues(['created_at', 'created_by', 'modified_at', 'modified_by']),
                variables: {library: 'record_lib', filters: [{field: 'id', condition: 'EQUAL', value: '123456'}]}
            },
            result: {
                data: {
                    records: {
                        list: [
                            {
                                _id: '123456',
                                ...mockRecord,
                                created_at: 1234567980,
                                created_by: mockRecord,
                                modified_at: 1234567980,
                                modified_by: mockRecord
                            }
                        ]
                    }
                }
            }
        }
    ];

    test('Display modal', async () => {
        const _handleClose = jest.fn();

        render(<EditRecordModal library={mockRecord.library.id} record={mockRecord} open onClose={_handleClose} />, {
            mocks: commonMocks
        });

        expect(screen.getByRole('dialog')).toBeVisible();
        expect(screen.getAllByText('record_label')[0]).toBeVisible();
        expect(screen.getByText('EditRecord')).toBeVisible();
    });

    test('Close modal', async () => {
        const _handleClose = jest.fn();

        render(<EditRecordModal library={mockRecord.library.id} record={mockRecord} open onClose={_handleClose} />, {
            mocks: commonMocks
        });

        fireEvent.click(screen.getByRole('button', {name: 'global.close'}));

        expect(_handleClose).toBeCalled();
    });

    describe('Creation mode', () => {
        test('Open modal in creation mode', async () => {
            const _handleClose = jest.fn();

            render(<EditRecordModal library={mockRecord.library.id} record={null} open onClose={_handleClose} />, {
                mocks: commonMocks
            });

            expect(await screen.findByText('EditRecord')).toBeVisible();
            expect(screen.getByText(/new_record/)).toBeVisible();
            expect(screen.getByRole('button', {name: /submit/})).toBeInTheDocument();
        });
    });
});
