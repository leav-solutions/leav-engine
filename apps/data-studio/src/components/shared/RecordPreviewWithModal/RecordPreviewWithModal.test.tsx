// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '@leav/ui';
import userEvent from '@testing-library/user-event';
import {render, screen} from '_tests/testUtils';
import {mockApplicationDetails} from '__mocks__/common/applications';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import RecordPreviewWithModal from './RecordPreviewWithModal';

jest.mock('components/FileModal', () => {
    return function FileModal() {
        return <div>FileModal</div>;
    };
});

describe('RecordPreviewWithModal', () => {
    test('Display modal on click', async () => {
        const previewFile = {
            ...mockRecordWhoAmI.preview.file
        };

        render(<RecordPreviewWithModal label="my file" image="/my_file.jpg" previewFile={previewFile} />);

        expect(screen.getByAltText('record preview')).toBeInTheDocument();
        expect(screen.queryByText('FileModal')).not.toBeInTheDocument();

        userEvent.click(screen.getByTestId('click-handler'));

        expect(screen.getByText('FileModal')).toBeInTheDocument();
    });

    test('Show checkerboard if app is in transparency mode', async () => {
        const previewFile = {
            ...mockRecordWhoAmI.preview.file
        };

        render(<RecordPreviewWithModal label="my file" image="/my_file.jpg" previewFile={previewFile} />, {
            currentApp: {...mockApplicationDetails, settings: {showTransparency: true}}
        });

        expect(screen.getByAltText('record preview')).toHaveStyle(`background: ${themeVars.checkerBoard}`);
    });
});
