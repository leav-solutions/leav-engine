import userEvent from '@testing-library/user-event';
import {render, screen, waitFor} from '../../../../../_tests/testUtils';
import {mockLibraryWithPreviewsSettings} from '../../../../../__mocks__/common/library';
import EditPreviewsSettingsModal from './EditPreviewsSettingsModal';

jest.mock('../../../../../hooks/useSharedTranslation/useSharedTranslation');

describe('EditPreviewsSettingsModal', () => {
    test('Display form', async () => {
        const mockHandleSubmit = jest.fn();

        render(
            <EditPreviewsSettingsModal
                previewsSetting={{...mockLibraryWithPreviewsSettings.previewsSettings[0], system: false}}
                open
                onClose={jest.fn()}
                onSubmit={mockHandleSubmit}
            />
        );

        expect(screen.getByRole('textbox', {name: /label_en/i})).toHaveValue('My settings');
        expect(screen.getByRole('textbox', {name: /description_en/i})).toHaveValue('My settings description');
        expect(screen.getByRole('spinbutton', {name: /density/i})).toHaveValue('300');
        expect(screen.getAllByRole('textbox', {name: /size_name/i})).toHaveLength(2);

        await userEvent.click(screen.getByRole('button', {name: /submit/i}));

        await waitFor(() => {
            expect(mockHandleSubmit).toHaveBeenCalled();
        });
    });

    test('Can add/delete sizes', async () => {
        const mockHandleSubmit = jest.fn();

        render(
            <EditPreviewsSettingsModal
                previewsSetting={{...mockLibraryWithPreviewsSettings.previewsSettings[0], system: false}}
                open
                onClose={jest.fn()}
                onSubmit={mockHandleSubmit}
            />
        );

        expect(screen.getAllByRole('textbox', {name: /size_name/i})).toHaveLength(2);

        await userEvent.click(screen.getByText(/add_size/i));

        expect(screen.getAllByRole('textbox', {name: /size_name/i})).toHaveLength(3);

        await userEvent.click(screen.getAllByRole('button', {name: /delete/i})[0]);
        await userEvent.click(screen.getByRole('button', {name: /confirm/i}));
        expect(screen.getAllByRole('textbox', {name: /size_name/i})).toHaveLength(2);
    });

    test('If readonly, everything is disabled', async () => {
        const mockHandleSubmit = jest.fn();

        render(
            <EditPreviewsSettingsModal
                previewsSetting={{...mockLibraryWithPreviewsSettings.previewsSettings[0], system: true}}
                open
                onClose={jest.fn()}
                onSubmit={mockHandleSubmit}
            />
        );

        expect(screen.getByRole('textbox', {name: /label_en/i})).toBeDisabled();
        expect(screen.getByRole('textbox', {name: /description_en/i})).toBeDisabled();
        expect(screen.getByRole('spinbutton', {name: /density/i})).toBeDisabled();
        expect(screen.getAllByRole('textbox', {name: /size_name/i})[0]).toBeDisabled();
    });
});
