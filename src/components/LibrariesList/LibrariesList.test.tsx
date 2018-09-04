import {shallow} from 'enzyme';
import * as React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {create} from 'react-test-renderer';
import {List} from 'semantic-ui-react';
import LibrariesList from './LibrariesList';

describe('LibrariesList', () => {
    test('Render list', async () => {
        const libraries = [
            {id: 'test', system: false, label: {fr: 'Test', en: null}},
            {id: 'test2', system: false, label: {fr: null, en: 'Test 2'}},
            {id: 'test3', system: false, label: null}
        ];

        const deleteLib = jest.fn();

        const comp = <LibrariesList libraries={libraries} onDeleteLibrary={deleteLib} />;
        const shallowComp = shallow(comp);

        const listItems = shallowComp.find(List.Item);

        expect(listItems.length).toBe(3);
        expect(
            listItems
                .at(0)
                .find(List.Header)
                .first()
                .props().children
        ).toEqual('Test');

        expect(
            listItems
                .at(1)
                .find(List.Header)
                .first()
                .props().children
        ).toEqual('Test 2');

        expect(
            listItems
                .at(2)
                .find(List.Header)
                .first()
                .props().children
        ).toEqual('test3');

        const renderedComp = create(<Router>{comp}</Router>).toJSON();
        expect(renderedComp).toMatchSnapshot();
    });
});
