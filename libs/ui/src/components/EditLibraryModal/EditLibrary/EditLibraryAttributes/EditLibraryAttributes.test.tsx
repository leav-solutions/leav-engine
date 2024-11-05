// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult} from '@apollo/client';
import {Mockify} from '@leav/utils';
import userEvent from '@testing-library/user-event';
import {mockLibraryAttribute} from '_ui/__mocks__/common/attribute';
import {mockLibraryWithDetails} from '_ui/__mocks__/common/library';
import * as gqlTypes from '../../../../_gqlTypes';
import {render, screen, waitFor} from '../../../../_tests/testUtils';
import EditLibraryAttributes from './EditLibraryAttributes';

jest.mock('../../../../hooks/useSharedTranslation/useSharedTranslation');

describe('EditLibraryAttributes', () => {
    const mockLibrary = {
        ...mockLibraryWithDetails,
        attributes: [
            {
                ...mockLibraryAttribute,
                id: 'attributeA',
                label: {
                    fr: 'Attribut A'
                }
            },
            {
                ...mockLibraryAttribute,
                id: 'attributeB',
                label: {
                    fr: 'Attribut B'
                }
            }
        ]
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
                            fr: 'Attribut A'
                        }
                    },
                    {
                        ...mockLibraryAttribute,
                        id: 'attributeB',
                        label: {
                            fr: 'Attribut B'
                        }
                    }
                ]
            }
        }
    };

    test('Render list of attributes', async () => {
        const user = userEvent.setup();
        const mockSaveLibraryMutation = jest.fn().mockReturnValue({
            data: {
                saveLibrary: {
                    ...mockLibraryWithDetails
                }
            }
        });
        jest.spyOn(gqlTypes, 'useSaveLibraryMutation').mockImplementation(() => [
            mockSaveLibraryMutation,
            {loading: false, called: false, client: null, reset: null, error: null}
        ]);

        jest.spyOn(gqlTypes, 'useGetAttributesQuery').mockImplementation(() => mockGetAttributesQuery as QueryResult);

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
                    attributes: ['attributeB']
                }
            }
        });
    });

    test('If not allowed, cannot delete an attribute', async () => {
        jest.spyOn(gqlTypes, 'useGetAttributesQuery').mockImplementation(() => mockGetAttributesQuery as QueryResult);
        render(
            <EditLibraryAttributes
                library={{
                    ...mockLibrary,
                    permissions: {
                        ...mockLibrary.permissions,
                        admin_library: false
                    }
                }}
            />
        );

        // Delete attribute A
        expect(screen.getAllByRole('button', {name: /delete/i})[0]).toBeDisabled();
    });
});
