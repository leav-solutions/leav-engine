// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockRecord} from '_ui/__mocks__/common/record';
import {RecordInformations} from './RecordInformations';
import {render, screen} from '../../../../../_tests/testUtils';
import userEvent from '@testing-library/user-event';

jest.mock(
    '_ui/components/RecordPreviewWithModal/FileModal/FileModal',
    () =>
        function MockFileModal() {
            return <div>FileModal</div>;
        }
);

describe('RecordInformations', () => {
    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
    });

    it('should display open preview modal button', () => {
        render(<RecordInformations record={mockRecord} recordData={null} />);

        expect(screen.getByLabelText('record_summary.open_preview_modal')).toBeInTheDocument();
    });

    it('should not display open preview modal button', () => {
        const mockRecordWithoutPreview = {...mockRecord, preview: null};

        render(<RecordInformations record={mockRecordWithoutPreview} recordData={null} />);

        expect(screen.queryByLabelText('record_summary.open_preview_modal')).not.toBeInTheDocument();
    });

    it('should open file modal on click on open preview modal button', async () => {
        render(<RecordInformations record={mockRecord} recordData={null} />);

        expect(screen.queryByText('FileModal')).not.toBeInTheDocument();

        await user.click(screen.getByLabelText('record_summary.open_preview_modal'));

        expect(screen.getByText('FileModal')).toBeInTheDocument();
    });
});
