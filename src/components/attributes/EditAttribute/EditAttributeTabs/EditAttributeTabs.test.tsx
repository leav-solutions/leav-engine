// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import {Location} from 'history';
import React from 'react';
import {Mockify} from '../../../../_types/Mockify';
import {mockAttrAdv, mockAttrSimple} from '../../../../__mocks__/attributes';
import EditAttributeTabs from './EditAttributeTabs';

jest.mock('../../../../utils/utils', () => ({
    localizedLabel: jest.fn().mockImplementation(l => l.fr)
}));

jest.mock('../../../../hooks/useLang');

describe('EditAttributeTabs', () => {
    const mockAttribute = {...mockAttrSimple};

    describe('Header', () => {
        test('Display header with attribute label', async () => {
            const comp = shallow(<EditAttributeTabs attribute={mockAttribute} />);

            expect(
                comp
                    .find('Header')
                    .shallow()
                    .text()
            ).toBe('Mon Attribut');
        });

        test('Display header for new attribute', async () => {
            const comp = shallow(<EditAttributeTabs />);

            expect(
                comp
                    .find('Header')
                    .shallow()
                    .text()
            ).toBe('attributes.new');
        });
    });

    describe('Tabs', () => {
        test('If attribute is not new, display all tabs', async () => {
            const comp = shallow(<EditAttributeTabs attribute={mockAttribute} />);

            const panes: any[] = comp.find('Tab').prop('panes');
            expect(panes.map(p => p.key)).toEqual(['infos', 'values_list', 'permissions', 'actions_list']);
        });

        test('If attribute is new, display only infos tab', async () => {
            const comp = shallow(<EditAttributeTabs />);

            const panes: any[] = comp.find('Tab').prop('panes');
            expect(panes.map(p => p.key)).toEqual(['infos']);
        });

        test('Show metadata tab for advanced attribute', async () => {
            const comp = shallow(<EditAttributeTabs attribute={{...mockAttrAdv}} />);

            const panes: any[] = comp.find('Tab').prop('panes');
            expect(panes.filter(p => p.key === 'metadata')).toHaveLength(1);
        });

        test('should open the tab in anchor', async () => {
            const tabName = 'permissions';
            const mockLocation: Mockify<Location> = {
                hash: '#' + tabName
            };

            const comp = shallow(
                <EditAttributeTabs attribute={{...mockAttrAdv}} location={mockLocation as Location} />
            );

            const activeIndex: number = comp.find('Tab').prop('activeIndex');
            const panes: any[] = comp.find('Tab').prop('panes');

            expect(panes.findIndex(p => p.key === tabName)).toBe(activeIndex);
        });
    });
});
