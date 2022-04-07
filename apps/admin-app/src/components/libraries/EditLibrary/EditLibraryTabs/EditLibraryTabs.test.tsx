// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import {History, Location} from 'history';
import React from 'react';
import {mockAttrSimple} from '__mocks__/attributes';
import {mockLibrary} from '__mocks__/libraries';
import EditLibraryTabs from '.';
import {
    GET_LIB_BY_ID_libraries_list,
    GET_LIB_BY_ID_libraries_list_attributes
} from '../../../../_gqlTypes/GET_LIB_BY_ID';
import {Mockify} from '../../../../_types/Mockify';

jest.mock('../../../../hooks/useUserData', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        id: 1,
        name: 'Test',
        permissions: {app_access_forms: true}
    }))
}));

describe('EditLibraryForm', () => {
    const mockHistory: Mockify<History> = {};

    const attributes: Mockify<GET_LIB_BY_ID_libraries_list_attributes[]> = [
        {
            ...mockAttrSimple,
            id: 'test_attr',
            label: {fr: 'Test', en: 'Test'},
            description: {fr: 'Test', en: 'Test'}
        }
    ];

    const library: Mockify<GET_LIB_BY_ID_libraries_list> = {
        ...mockLibrary,
        id: 'test',
        label: {fr: 'Test', en: null},
        system: false,
        attributes: attributes as GET_LIB_BY_ID_libraries_list_attributes[],
        recordIdentityConf: {label: null, color: null, preview: null}
    };

    beforeAll(() => {
        jest.mock('../../../../utils/utils', () => ({
            formatIDString: jest.fn().mockImplementation(s => s),
            localizedLabel: jest.fn().mockImplementation(l => l.fr)
        }));
    });

    afterAll(() => {
        jest.unmock('../../../../utils/utils');
    });

    beforeEach(() => jest.clearAllMocks());

    test('Render form for existing lib', async () => {
        const comp = shallow(
            <EditLibraryTabs
                library={library as GET_LIB_BY_ID_libraries_list}
                readOnly={false}
                history={mockHistory as History}
            />
        );

        expect(comp.find('Header').shallow().text()).toBe('Test');

        // Check forms pane is present
        const panes = comp.find('Tab').prop('panes');
        expect(Array.isArray(panes)).toBe(true);
        if (Array.isArray(panes)) {
            expect(panes.filter(p => p.key === 'forms')).toHaveLength(1);
        }
    });

    test('Render form for new lib', async () => {
        const comp = shallow(<EditLibraryTabs library={null} readOnly={false} history={mockHistory as History} />);

        expect(comp.find('Header').shallow().text()).toBe('libraries.new');
    });

    test('Should open the tab in anchor', async () => {
        const tabName = 'permissions';
        const mockLocation: Mockify<Location> = {
            hash: '#' + tabName
        };

        const comp = shallow(
            <EditLibraryTabs
                library={null}
                readOnly={false}
                history={mockHistory as History}
                location={mockLocation as Location}
            />
        );

        const activeIndex: number = comp.find('Tab').prop('activeIndex');
        const panes: any[] = comp.find('Tab').prop('panes');

        expect(panes.findIndex(p => p.key === tabName)).toBe(activeIndex);
    });
});
