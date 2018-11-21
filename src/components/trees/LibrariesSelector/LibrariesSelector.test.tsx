import {render} from 'enzyme';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {AvailableLanguage} from 'src/_gqlTypes/globalTypes';
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
