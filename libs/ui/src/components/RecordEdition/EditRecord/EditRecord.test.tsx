// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {UserEvent} from '@testing-library/user-event/dist/types/setup/setup';
import {useRef} from 'react';
import {getRecordColumnsValues} from '_ui/_queries/records/getRecordColumnsValues';
import {mockRecord} from '_ui/__mocks__/common/record';
import {IUseCanEditRecordHook} from '../../../hooks/useCanEditRecord/useCanEditRecord';
import {render, screen} from '../../../_tests/testUtils';
import {EditRecord} from './EditRecord';
import {Form} from 'antd';

jest.mock('../EditRecordContent', () => function EditRecordContent() {
        return <div>EditRecordContent</div>;
    });

jest.mock('hooks/useCanEditRecord/useCanEditRecord', () => ({
    useCanEditRecord: (): IUseCanEditRecordHook => ({loading: false, canEdit: true, isReadOnly: false})
}));

const EditRecordWithForm = props => {
    const [form] = Form.useForm();

    return <EditRecord form={form} {...props} />;
};

describe('EditRecord', () => {
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

    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
    });

    test('Display form', async () => {
        const CompWithButtons = () => {
            const closeButtonRef = useRef<HTMLButtonElement>(null);

            return (
                <>
                    <button ref={closeButtonRef}>Close</button>;
                    <EditRecordWithForm
                        withInfoButton={false}
                        library={mockRecord.library.id}
                        record={mockRecord}
                        buttonsRefs={{}}
                    />
                </>
            );
        };

        render(<CompWithButtons />, {
            mocks: commonMocks
        });

        expect(screen.getByText('EditRecordContent')).toBeVisible();
    });
});
