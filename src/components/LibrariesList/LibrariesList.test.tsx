import * as React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {create} from 'react-test-renderer';
import LibrariesList from './LibrariesList';

describe('LibrariesList', () => {
    test('Render list', async () => {
        const libraries = [
            {id: 'test', system: false, label: {fr: 'Test', en: null}, attributes: []},
            {id: 'test2', system: false, label: {fr: null, en: 'Test 2'}, attributes: []},
            {id: 'test3', system: false, label: null, attributes: []}
        ];

        const comp = <LibrariesList libraries={libraries} />;
        const renderedComp = create(<Router>{comp}</Router>).toJSON();
        expect(renderedComp).toMatchSnapshot();
    });
});
