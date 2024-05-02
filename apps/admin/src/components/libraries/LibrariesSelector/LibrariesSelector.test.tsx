// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {AvailableLanguage} from '../../../_gqlTypes/globalTypes';
import LibrariesSelector from './LibrariesSelector';

jest.mock('../../../hooks/useLang');

jest.mock('../LibrariesSelectorField', () => function LibrariesSelectorField() {
        return <div>LibrariesSelectorField</div>;
    });

describe('LibrariesSelector', () => {
    test('Snapshot test', async () => {
        await act(async () => {
            render(<LibrariesSelector lang={[AvailableLanguage.fr]} />);
        });

        expect(screen.getByText('LibrariesSelectorField')).toBeInTheDocument();
    });
});
