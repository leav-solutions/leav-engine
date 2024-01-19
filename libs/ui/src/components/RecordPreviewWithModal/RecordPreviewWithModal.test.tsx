// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {mockRecord} from '_ui/__mocks__/common/record';
import {themeVars} from '../../antdTheme';
import {render, screen} from '../../_tests/testUtils';
import RecordPreviewWithModal from './RecordPreviewWithModal';

jest.mock('_ui/components/RecordPreviewWithModal/FileModal', () => {
    return function FileModal() {
        return <div>FileModal</div>;
    };
});

describe('RecordPreviewWithModal', () => {
    test('Display modal on click', async () => {
        const previewFile = {
            ...mockRecord.preview.file
        };

        render(<RecordPreviewWithModal label="my file" image="/my_file.jpg" previewFile={previewFile} />);

        expect(screen.getByAltText('record preview')).toBeInTheDocument();
        expect(screen.queryByText('FileModal')).not.toBeInTheDocument();

        userEvent.click(screen.getByTestId('click-handler'));

        expect(await screen.findByText('FileModal')).toBeInTheDocument();
    });

    test('Show checkerboard if app is in transparency mode', async () => {
        const previewFile = {
            ...mockRecord.preview.file
        };

        render(
            <RecordPreviewWithModal
                label="my file"
                image="/my_file.jpg"
                previewFile={previewFile}
                showTransparency={false}
            />
        );

        expect(screen.getByAltText('record preview')).toHaveStyle(`background: ${themeVars.checkerBoard}`);
    });
});
