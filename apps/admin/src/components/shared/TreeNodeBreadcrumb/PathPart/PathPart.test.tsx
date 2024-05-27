// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import PathPart from './PathPart';

jest.mock('../../RecordCard', () => function RecordCard({record}) {
        return <div data-test-id={`record_card_${record.id}`} />;
    });

describe('PathPart', () => {
    const record = {
        id: '1',
        library: {
            id: 'test_lib',
            label: {
                fr: 'Test Lib'
            }
        },
        label: 'TestLabel',
        color: null,
        preview: null
    };

    test('Display element record card', async () => {
        const comp = shallow(<PathPart record={record} />);

        expect(comp.find('RecordCard')).toHaveLength(1);
    });

    test('Show actions menu', async () => {
        const actions = [
            {
                text: 'Some action',
                icon: 'trash',
                action: jest.fn(),
                displayFilter: () => true
            },
            {
                text: 'Some action 2',
                icon: 'trash',
                action: jest.fn(),
                displayFilter: () => true
            }
        ];

        const comp = shallow(<PathPart record={record} actions={actions} />);
        comp.find('[data-test-id="path_part_wrapper"]').simulate('mouseEnter');

        expect(comp.find('DropdownItem')).toHaveLength(2);
    });

    test('Filter actions menu', async () => {
        const actions = [
            {
                text: 'Some action',
                icon: 'trash',
                action: jest.fn(),
                displayFilter: r => r.id !== '1'
            },
            {
                text: 'Some action 2',
                icon: 'trash',
                action: jest.fn(),
                displayFilter: () => true
            }
        ];

        const comp = shallow(<PathPart record={record} actions={actions} />);
        comp.find('[data-test-id="path_part_wrapper"]').simulate('mouseEnter');

        expect(comp.find('DropdownItem')).toHaveLength(1);
    });
});
