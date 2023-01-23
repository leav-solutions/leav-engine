// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {render, screen} from '_tests/testUtils';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import RecordPreviewWithModal from './RecordPreviewWithModal';

jest.mock('components/FileModal', () => {
    return function FileModal() {
        return <div>FileModal</div>;
    };
});

jest.mock('../RecordPreview', () => {
    return function RecordPreview() {
        return <div>RecordPreview</div>;
    };
});

describe('RecordPreviewWithModal', () => {
    test('Display modal on click', async () => {
        const previewFile = {
            ...mockRecordWhoAmI.preview.file
        };

        render(<RecordPreviewWithModal label="my file" image="/my_file.jpg" previewFile={previewFile} />);

        expect(screen.getByText('RecordPreview')).toBeInTheDocument();
        expect(screen.queryByText('FileModal')).not.toBeInTheDocument();

        userEvent.click(screen.getByTestId('click-handler'));

        expect(screen.getByText('FileModal')).toBeInTheDocument();
    });
});
