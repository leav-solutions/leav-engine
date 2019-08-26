import {MockedProvider} from '@apollo/react-testing';
import {mount, shallow} from 'enzyme';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import LibrariesList from './LibrariesList';

describe('LibrariesList', () => {
    const libraries = [
        {
            id: 'test',
            system: false,
            label: {fr: 'Test', en: null},
            attributes: [],
            permissions_conf: null,
            recordIdentityConf: {label: null, color: null, preview: null}
        },
        {
            id: 'test2',
            system: false,
            label: {fr: null, en: 'Test 2'},
            attributes: [],
            permissions_conf: null,
            recordIdentityConf: {label: null, color: null, preview: null}
        },
        {
            id: 'test3',
            system: false,
            label: null,
            attributes: [],
            permissions_conf: null,
            recordIdentityConf: {label: null, color: null, preview: null}
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
