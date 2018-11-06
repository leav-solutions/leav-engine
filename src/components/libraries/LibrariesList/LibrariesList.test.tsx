import {i18n} from 'i18next';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {BrowserRouter as Router} from 'react-router-dom';
import {create} from 'react-test-renderer';
import {Mockify} from 'src/_types/Mockify';
import LibrariesList from './LibrariesList';

describe('LibrariesList', () => {
    test('Render list', async () => {
        const libraries = [
            {id: 'test', system: false, label: {fr: 'Test', en: null}, attributes: []},
            {id: 'test2', system: false, label: {fr: null, en: 'Test 2'}, attributes: []},
            {id: 'test3', system: false, label: null, attributes: []}
        ];

        const onRowClick = jest.fn();
        const mockI18n: Mockify<i18n> = {
            language: 'fr',
            options: {
                fallbackLng: ['en']
            }
        };

        const comp = <LibrariesList libraries={libraries} onRowClick={onRowClick} i18n={mockI18n as i18n} />;
        const renderedComp = create(
            <Router>
                <MockedProvider>{comp}</MockedProvider>
            </Router>
        ).toJSON();
        expect(renderedComp).toMatchSnapshot();
    });
});
