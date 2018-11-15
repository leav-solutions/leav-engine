import {mount, shallow} from 'enzyme';
import {i18n} from 'i18next';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {BrowserRouter as Router} from 'react-router-dom';
import {Mockify} from 'src/_types/Mockify';
import LibrariesList from './LibrariesList';

describe('LibrariesList', () => {
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
    const onFiltersUpdate = jest.fn();
    test('Render libraries list with filters', async () => {
        const comp = shallow(
            <Router>
                <MockedProvider>
                    <LibrariesList
                        libraries={libraries}
                        onRowClick={onRowClick}
                        i18n={mockI18n as i18n}
                        onFiltersUpdate={onFiltersUpdate}
                    />
                </MockedProvider>
            </Router>
        );
        const libListComp = comp.find('LibrariesList').shallow();

        expect(libListComp.find('TableBody TableRow').length).toEqual(3);
        expect(libListComp.find('TableRow.filters').length).toEqual(1);
    });

    test('Calls callback on filter update', () => {
        const changeFilter = jest.fn();
        const comp = mount(
            <MockedProvider>
                <LibrariesList
                    libraries={libraries}
                    onRowClick={onRowClick}
                    i18n={mockI18n as i18n}
                    onFiltersUpdate={changeFilter}
                />
            </MockedProvider>
        );

        comp.find('.filters input[name="label"]').simulate('change', {target: {value: 'MyLabel'}});
        comp.find('.filters input[name="id"]').simulate('change');
        comp.find('.filters input[name="system"]').simulate('change');

        expect(changeFilter).toHaveBeenCalledTimes(3);
        expect(changeFilter.mock.calls[0][0]).toMatchObject({value: 'MyLabel'});
    });
});
