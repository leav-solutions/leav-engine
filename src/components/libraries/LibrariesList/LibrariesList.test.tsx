import {MockedProvider} from '@apollo/react-testing';
import {mount, shallow} from 'enzyme';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {mockLibrary} from '../../../__mocks__/libraries';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import LibrariesList from './LibrariesList';

jest.mock('../../../hooks/useLang');

describe('LibrariesList', () => {
    const libraries = [
        {
            ...mockLibrary,
            id: 'test',
            label: {fr: 'Test', en: null}
        },
        {
            ...mockLibrary,
            id: 'test2',
            label: {fr: null, en: 'Test 2'}
        },
        {
            ...mockLibrary,
            id: 'test3',
            label: null
        }
    ];

    const onRowClick = jest.fn();

    const onFiltersUpdate = jest.fn();
    test('Render libraries list with filters', async () => {
        const comp = shallow(
            <Router>
                <MockedProvider>
                    <MockedUserContextProvider>
                        <LibrariesList
                            libraries={libraries}
                            onRowClick={onRowClick}
                            onFiltersUpdate={onFiltersUpdate}
                        />
                    </MockedUserContextProvider>
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
                <MockedUserContextProvider>
                    <LibrariesList libraries={libraries} onRowClick={onRowClick} onFiltersUpdate={changeFilter} />
                </MockedUserContextProvider>
            </MockedProvider>
        );

        comp.find('.filters input[name="label"]').simulate('change', {target: {value: 'MyLabel'}});
        comp.find('.filters input[name="id"]').simulate('change');
        comp.find('.filters input[name="system"]').simulate('change');

        expect(changeFilter).toHaveBeenCalledTimes(3);
        expect(changeFilter.mock.calls[0][0]).toMatchObject({value: 'MyLabel'});
    });
});
