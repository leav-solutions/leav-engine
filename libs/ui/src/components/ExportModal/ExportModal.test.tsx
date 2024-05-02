// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {ExportDocument} from '_ui/_gqlTypes';
import {render, screen} from '_ui/_tests/testUtils';
import ExportModal from './ExportModal';

jest.mock('_ui/components/AttributesSelectionList', () => function AttributesSelectionList() {
        return <div>AttributesSelectionList</div>;
    });

describe('ExportModal', () => {
    test('Run export', async () => {
        const onClose = jest.fn();

        const mocks = [
            {
                request: {
                    query: ExportDocument,
                    variables: {library: 'test_lib', attributes: ['id'], filters: []}
                },
                result: {
                    data: {
                        export: '/path/to/file.xls'
                    }
                }
            }
        ];

        render(
            <ExportModal library="test_lib" selection={{selected: [], allSelected: false}} open onClose={onClose} />,
            {mocks}
        );

        expect(screen.getByText('AttributesSelectionList')).toBeInTheDocument();

        userEvent.click(screen.getByRole('button', {name: /start/}));

        expect(await screen.findByText(/done/)).toBeInTheDocument();
    });
});
