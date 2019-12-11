import {shallow} from 'enzyme';
import React from 'react';
import {mockAttrAdv} from '../../../../__mocks__/attributes';
import EditAttributeTabs from './EditAttributeTabs';

jest.mock('../../../../utils/utils', () => ({
    localizedLabel: jest.fn().mockImplementation(l => l.fr)
}));

jest.mock('../../../../hooks/useLang');

describe('EditAttributeTabs', () => {
    const mockAttribute = {...mockAttrAdv};

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

            expect(comp.find('Tab').prop('panes')).toHaveLength(3);
        });

        test('If attribute is new, display only infos tab', async () => {
            const comp = shallow(<EditAttributeTabs />);

            expect(comp.find('Tab').prop('panes')).toHaveLength(1);
        });
    });
});
