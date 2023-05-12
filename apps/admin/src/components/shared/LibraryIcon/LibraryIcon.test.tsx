// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {render, screen} from '_tests/testUtils';
import LibraryIcon from './LibraryIcon';

describe('LibraryIcon', () => {
    test('Display library icon', async () => {
        const mockLibrary = {
            id: '123456',
            behavior: LibraryBehavior.files,
            icon: {
                whoAmI: {
                    id: '123465',
                    library: {
                        id: 'files',
                        label: {en: 'Files'}
                    },
                    label: null,
                    color: null,
                    preview: {
                        tiny: 'path/to/file.png',
                        small: 'path/to/file.png',
                        medium: 'path/to/file.png',
                        big: 'path/to/file.png',
                        huge: 'path/to/file.png',
                        pdf: 'path/to/file.pdf'
                    }
                }
            }
        };

        render(<LibraryIcon library={mockLibrary} />);

        expect(screen.getByRole('img')).toHaveAttribute('src', 'path/to/file.png');
    });

    test('Display generic icon if no icon defined on library', async () => {
        const mockLibrary = {
            id: '123456',
            behavior: LibraryBehavior.files,
            icon: null
        };

        render(<LibraryIcon library={mockLibrary} />);

        expect(screen.getByTestId('generic-icon')).toBeInTheDocument();
    });
});
