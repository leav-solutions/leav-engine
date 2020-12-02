// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
import {AvailableLanguage} from '../../../_gqlTypes/globalTypes';
import LibrariesSelector from './LibrariesSelector';

jest.mock('../../../hooks/useLang');

describe('LibrariesSelector', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProvider>
                <LibrariesSelector lang={[AvailableLanguage.fr]} />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
