import {render} from 'enzyme';
import {History} from 'history';
import {i18n} from 'i18next';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {Mockify} from 'src/_types/Mockify';
import EditLibrary from './EditLibrary';

describe('EditLibrary', () => {
    test('Snapshot test', async () => {
        const mockMatch: any = {params: {id: 'test'}};
        const mockHistory: Mockify<History> = {};
        const mockI18n: Mockify<i18n> = {
            language: 'fr',
            options: {
                fallbackLng: ['en']
            }
        };

        const comp = render(
            <MockedProvider>
                <EditLibrary match={mockMatch} history={mockHistory as History} i18n={mockI18n as i18n} />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
