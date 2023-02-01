// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {forcePreviewsGenerationMutation} from 'graphQL/mutations/files/forcePreviewsGenerationMutation';
import {render, screen, waitFor} from '_tests/testUtils';
import TriggerPreviewsGenerationModal from './TriggerPreviewsGenerationModal';

describe('TriggerPreviewsGenerationModal', () => {
    test('Display confirm message and trigger mutation', async () => {
        let mutationCalled = false;
        const mocks = [
            {
                request: {
                    query: forcePreviewsGenerationMutation,
                    variables: {
                        libraryId: 'files',
                        recordIds: ['123456'],
                        filters: null,
                        failedOnly: false
                    }
                },
                result: () => {
                    mutationCalled = true;
                    return {
                        data: {
                            forcePreviewsGeneration: true
                        }
                    };
                }
            }
        ];

        render(<TriggerPreviewsGenerationModal libraryId="files" recordIds={['123456']} onClose={jest.fn()} />, {
            apolloMocks: mocks
        });

        expect(screen.getByText('files.previews_generation_confirm')).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeInTheDocument();

        userEvent.click(screen.getByRole('button', {name: /submit/}));

        await waitFor(() => expect(mutationCalled).toBe(true));
    });

    test('Can choose to generate only failed previews', async () => {
        let mutationCalled = false;
        const mocks = [
            {
                request: {
                    query: forcePreviewsGenerationMutation,
                    variables: {
                        libraryId: 'files',
                        recordIds: ['123456'],
                        filters: null,
                        failedOnly: true
                    }
                },
                result: () => {
                    mutationCalled = true;
                    return {
                        data: {
                            forcePreviewsGeneration: true
                        }
                    };
                }
            }
        ];

        render(<TriggerPreviewsGenerationModal libraryId="files" recordIds={['123456']} onClose={jest.fn()} />, {
            apolloMocks: mocks
        });

        userEvent.click(screen.getByRole('checkbox'));
        userEvent.click(screen.getByRole('button', {name: /submit/}));

        await waitFor(() => expect(mutationCalled).toBe(true));
    });
});
