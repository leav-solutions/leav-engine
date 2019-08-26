import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
import {AvailableLanguage} from '../../../_gqlTypes/globalTypes';
import LibrariesSelector from './LibrariesSelector';

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
