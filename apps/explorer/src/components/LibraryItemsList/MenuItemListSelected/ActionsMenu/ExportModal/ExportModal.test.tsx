// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {render, screen} from '_tests/testUtils';
import {exportQuery} from '../../../../../graphQL/queries/export/exportQuery';
import ExportModal from './ExportModal';

jest.mock('../../../../../hooks/ActiveLibHook/ActiveLibHook');

jest.mock('../../../../AttributesSelectionList', () => {
    return function AttributesSelectionList() {
        return <div>AttributesSelectionList</div>;
    };
});

describe('ExportModal', () => {
    test('Run export', async () => {
        const onClose = jest.fn();

        const mocks = [
            {
                request: {
                    query: exportQuery,
                    variables: {library: 'test_lib', attributes: ['id'], filters: []}
                },
                result: {
                    data: {
                        export: '/path/to/file.xls'
                    }
                }
            }
        ];

        render(<ExportModal open onClose={onClose} />, {apolloMocks: mocks});

        expect(screen.getByText('AttributesSelectionList')).toBeInTheDocument();

        userEvent.click(screen.getByRole('button', {name: /start/}));

        expect(await screen.findByText(/done/)).toBeInTheDocument();
    });
});
