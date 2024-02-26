// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {mockRecord} from '_ui/__mocks__/common/record';
import {themeVars} from '../../antdTheme';
import {render, screen} from '../../_tests/testUtils';
import RecordPreviewWithModal from './RecordPreviewWithModal';

const fileModalLabel = 'FileModal';

jest.mock('_ui/components/RecordPreviewWithModal/FileModal', () => () => <div>{fileModalLabel}</div>);

describe('RecordPreviewWithModal', () => {
    describe('With preview', () => {
        beforeEach(() => {
            const previewFile = {
                ...mockRecord.preview.file
            };

            render(<RecordPreviewWithModal label="my file" image="/my_file.jpg" previewFile={previewFile} />);
        });

        test('Display modal on click', async () => {
            expect(screen.getByAltText('record preview')).toBeVisible();
            expect(screen.queryByText(fileModalLabel)).not.toBeInTheDocument();

            await userEvent.click(screen.getByTestId('click-handler'));

            expect(screen.getByText(fileModalLabel)).toBeVisible();
        });

        test('should display overlay when preview is provided', async () => {
            await userEvent.hover(screen.getByTestId('click-handler'));

            expect(screen.queryByTitle('record_summary.preview_title')).toBeVisible();
        });
    });

    describe('Without preview', () => {
        beforeEach(() => {
            render(<RecordPreviewWithModal label="my file" image="/my_file.jpg" previewFile={undefined} />);
        });

        test('should not display modal on click', async () => {
            expect(screen.getByAltText('record preview')).toBeVisible();
            expect(screen.queryByText(fileModalLabel)).not.toBeInTheDocument();

            await userEvent.click(screen.getByTestId('click-handler'));

            expect(screen.queryByText(fileModalLabel)).not.toBeInTheDocument();
        });

        test('should not display overlay', async () => {
            await userEvent.hover(screen.getByTestId('click-handler'));

            expect(screen.queryByTitle('record_summary.preview_title')).not.toBeInTheDocument();
        });
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
