import {History} from 'history';
import {i18n} from 'i18next';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {BrowserRouter as Router} from 'react-router-dom';
import {create} from 'react-test-renderer';
import {Mockify} from 'src/_types/Mockify';
import Attributes from './Attributes';

describe('Attributes', () => {
    test('Snapshot test', async () => {
        const mockHistory: Mockify<History> = {};
        const mockI18n: Mockify<i18n> = {
            language: 'fr',
            options: {
                fallbackLng: ['en']
            }
        };
        const comp = create(
            <MockedProvider>
                <Router>
                    <Attributes history={mockHistory as History} i18n={mockI18n as i18n} />
                </Router>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
