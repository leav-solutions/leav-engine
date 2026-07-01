import {type QueryResult} from '@apollo/client';
import {type Mockify} from '_ui/__mocks__/utils';
import userEvent from '@testing-library/user-event';
import {mockLibraryAttribute} from '_ui/__mocks__/common/attribute';
import {mockLibraryWithDetails} from '_ui/__mocks__/common/library';
import * as gqlTypes from '../../../../_gqlTypes';
import {render, screen, waitFor} from '../../../../_tests/testUtils';
import EditLibraryAttributes from './EditLibraryAttributes';

vi.mock('../../../../hooks/useSharedTranslation/useSharedTranslation');

vi.mock('antd', async () => ({
    ...(await vi.importActual('antd')),
    message: {
        error: vi.fn(),
    },
}));

describe('EditLibraryAttributes', () => {
    const mockLibrary = {
        ...mockLibraryWithDetails,
        attributes: [
            {
                ...mockLibraryAttribute,
                id: 'attributeA',
                label: {
                    fr: 'Attribut A',
                },
            },
            {
                ...mockLibraryAttribute,
                id: 'attributeB',
                label: {
                    fr: 'Attribut B',
                },
            },
        ],
    };

    const mockGetAttributesQuery: Mockify<QueryResult> = {
        loading: false,
        error: null,
        data: {
            attributes: {
                totalCount: 2,
                list: [
                    {
                        ...mockLibraryAttribute,
                        id: 'attributeA',
                        label: {
                            fr: 'Attribut A',
                        },
                    },
                    {
                        ...mockLibraryAttribute,
                        id: 'attributeB',
                        label: {
                            fr: 'Attribut B',
                        },
                    },
                ],
            },
        },
    };

    test('Render list of attributes', async () => {
        const user = userEvent.setup();
        const mockSaveLibraryMutation = vi.fn().mockReturnValue({
            data: {
                saveLibrary: {
                    ...mockLibraryWithDetails,
                },
            },
        });
        vi.spyOn(gqlTypes, 'useSaveLibraryMutation').mockImplementation(() => [
            mockSaveLibraryMutation,
            {loading: false, called: false, client: null, reset: null, error: null},
        ]);

        vi.spyOn(gqlTypes, 'useGetAttributesQuery').mockImplementation(() => mockGetAttributesQuery as QueryResult);

        render(<EditLibraryAttributes library={mockLibrary} />);

        await waitFor(() => expect(screen.getByText('Attribut A')).toBeInTheDocument());
        expect(screen.getByText('Attribut B')).toBeInTheDocument();

        // Delete attribute A
        await user.click(screen.getAllByRole('button', {name: /delete/i})[0]);
        await user.click(screen.getByRole('button', {name: /submit/i})); // Confirm

        expect(mockSaveLibraryMutation).toBeCalledWith({
            variables: {
                library: {
                    id: mockLibrary.id,
                    attributes: ['attributeB'],
                },
            },
        });
    });

    test('If not allowed, cannot delete an attribute', async () => {
        vi.spyOn(gqlTypes, 'useGetAttributesQuery').mockImplementation(() => mockGetAttributesQuery as QueryResult);
        render(
            <EditLibraryAttributes
                library={{
                    ...mockLibrary,
                    permissions: {
                        ...mockLibrary.permissions,
                        admin_library: false,
                    },
                }}
            />,
        );

        // Delete attribute A
        expect(screen.getAllByRole('button', {name: /delete/i})[0]).toBeDisabled();
    });
});
