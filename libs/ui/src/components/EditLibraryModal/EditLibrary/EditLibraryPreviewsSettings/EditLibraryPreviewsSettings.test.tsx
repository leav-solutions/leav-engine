// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import * as gqlTypes from '../../../../_gqlTypes';
import {render, screen, waitFor} from '../../../../_tests/testUtils';
import {mockLibraryWithPreviewsSettings} from '../../../../__mocks__/common/library';
import EditLibraryPreviewsSettings from './EditLibraryPreviewsSettings';

jest.mock('../../../../hooks/useSharedTranslation/useSharedTranslation');

jest.mock('./EditPreviewsSettingsModal', () => {
    return {
        EditPreviewsSettingsModal: () => {
            return <div>EditPreviewsSettingsModal</div>;
        }
    };
});

describe('EditLibraryPreviewsSettings', () => {
    test('Display list of previews settings', async () => {
        render(<EditLibraryPreviewsSettings library={mockLibraryWithPreviewsSettings} />);

        expect(screen.getAllByRole('row')).toHaveLength(2);

        // Labels
        expect(screen.getByText('My settings')).toBeInTheDocument();

        // Density
        expect(screen.getByText('300 dpi')).toBeInTheDocument();

        // Sizes
        expect(screen.getByText('200')).toBeInTheDocument();

        // Display description on hover label
        const firstVersionLabel = screen.getByText('My settings');
        await userEvent.hover(firstVersionLabel);
        expect(await screen.findByText('My settings description')).toBeInTheDocument();

        // Display size name on hover size
        await userEvent.hover(screen.getByText('1337'));
        expect(await screen.findByText('other_size2')).toBeInTheDocument();

        const editButtons = screen.getAllByRole('button', {name: /expand/, hidden: true});
        expect(editButtons).toHaveLength(2);

        userEvent.click(editButtons[0]);
        expect(await screen.findByText('EditPreviewsSettingsModal')).toBeInTheDocument();
    });

    test('Can add new settings', async () => {
        render(<EditLibraryPreviewsSettings library={mockLibraryWithPreviewsSettings} />);
        const addNewSettingsButton = screen.getByRole('button', {name: /add_settings/i});
        userEvent.click(addNewSettingsButton);

        expect(await screen.findByText('EditPreviewsSettingsModal')).toBeInTheDocument();
    });

    test('Can delete settings', async () => {
        const mockSaveLibraryMutation = jest.fn().mockReturnValue({
            data: {
                saveLibrary: {
                    ...mockLibraryWithPreviewsSettings,
                    previewsSettings: [mockLibraryWithPreviewsSettings.previewsSettings[0]]
                }
            }
        });

        jest.spyOn(gqlTypes, 'useSaveLibraryMutation').mockImplementation(() => [
            mockSaveLibraryMutation,
            {loading: false, called: true, client: null, reset: null, error: null}
        ]);

        render(<EditLibraryPreviewsSettings library={mockLibraryWithPreviewsSettings} />);

        const deleteButtons = screen.getAllByRole('button', {name: /delete/i});
        expect(deleteButtons).toHaveLength(2);
        expect(deleteButtons[0]).toBeDisabled(); // System version, cannot delete

        await userEvent.click(deleteButtons[1]);
        userEvent.click(await screen.findByRole('button', {name: /submit/i}));

        await waitFor(() => expect(mockSaveLibraryMutation).toBeCalled());
    });
});
