// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {act} from 'react-dom/test-utils';
import {render, screen, waitFor} from '../../_tests/testUtils';
import * as gqlTypes from '../../_gqlTypes';
import PreviewsGenerationModal from './PreviewsGenerationModal';
import {Mockify} from '@leav/utils';
import {QueryResult, MutationResult} from '@apollo/client';
import {mockLibrarySimple} from '../../__mocks__/common/library';

describe('PreviewsGenerationModal', () => {
    const mockLibBase = {
        ...mockLibrarySimple,
        previewsSettings: [
            {
                description: null,
                system: true,
                label: {fr: 'PreviewSettings1', en: 'PreviewSettings1'},
                versions: {
                    background: 'background',
                    density: 1,
                    sizes: [
                        {
                            name: 'PreviewSettings1ChildName',
                            size: 'PreviewSettings1ChildSize'
                        }
                    ]
                }
            }
        ]
    };

    test('Display confirm message and trigger mutation', async () => {
        const mockResultGetLibrariesListQuery: Mockify<typeof gqlTypes.useGetLibrariesListQuery> = {
            loading: false,
            data: {
                libraries: {
                    list: [
                        {
                            ...mockLibBase,
                            id: 'files'
                        }
                    ]
                }
            },
            called: true
        };

        jest.spyOn(gqlTypes, 'useGetLibrariesListQuery').mockImplementation(
            () => mockResultGetLibrariesListQuery as QueryResult
        );

        const mockForcePreviewsGenerationMutation = jest.fn().mockReturnValue({
            data: {
                forcePreviewsGeneration: true
            }
        });

        jest.spyOn(gqlTypes, 'useForcePreviewsGenerationMutation').mockImplementation(() => [
            mockForcePreviewsGenerationMutation,
            {loading: false, called: true, client: null, reset: null, error: null}
        ]);

        render(
            <PreviewsGenerationModal
                libraryId={'files'}
                recordIds={['123456']}
                onClose={jest.fn()}
                onResult={jest.fn()}
            />
        );

        expect(screen.getByText('files.generate_previews')).toBeInTheDocument();

        const settingsElem = await screen.findByText('PreviewSettings1');
        await act(async () => {
            userEvent.click(settingsElem);
        });

        await waitFor(() => expect(screen.getByRole('button', {name: /submit/})).not.toBeDisabled());

        userEvent.click(screen.getByRole('button', {name: /submit/}));
    });

    test('Can choose to generate only failed previews', async () => {
        const mockResultGetLibrariesListQuery: Mockify<typeof gqlTypes.useGetLibrariesListQuery> = {
            loading: false,
            data: {
                libraries: {
                    list: [
                        {
                            ...mockLibBase,
                            id: 'files'
                        }
                    ]
                }
            },
            called: true
        };

        jest.spyOn(gqlTypes, 'useGetLibrariesListQuery').mockImplementation(
            () => mockResultGetLibrariesListQuery as QueryResult
        );

        const mockForcePreviewsGenerationMutation = jest.fn().mockReturnValue({
            data: {
                forcePreviewsGeneration: true
            }
        });

        jest.spyOn(gqlTypes, 'useForcePreviewsGenerationMutation').mockImplementation(() => [
            mockForcePreviewsGenerationMutation,
            {loading: false, called: true, client: null, reset: null, error: null}
        ]);

        render(
            <PreviewsGenerationModal
                libraryId="files"
                recordIds={['123456']}
                onClose={jest.fn()}
                onResult={jest.fn()}
            />
        );

        expect(await screen.findByText('files.previews_generation_failed_only')).toBeInTheDocument();

        const settingsElem = await screen.findByText('PreviewSettings1');
        await act(async () => {
            userEvent.click(settingsElem);
        });

        const checkboxElem = await screen.findByRole('checkbox', {name: /failed-only/});
        userEvent.click(checkboxElem);

        await waitFor(() => expect(screen.getByRole('button', {name: /submit/})).not.toBeDisabled());
        userEvent.click(screen.getByRole('button', {name: /submit/}));
    });
});
