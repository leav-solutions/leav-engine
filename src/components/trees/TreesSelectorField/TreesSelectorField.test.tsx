import {shallow} from 'enzyme';
import React from 'react';
import {GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {mockTree} from '../../../__mocks__/trees';
import TreesSelectorField from './TreesSelectorField';

jest.mock('../../../hooks/useLang');

describe('TreesSelectorField', () => {
    const trees: GET_TREES_trees_list[] = [
        {
            ...mockTree,
            id: 'tree1'
        },
        {
            ...mockTree,
            id: 'tree2'
        }
    ];

    test('Render a dropdown with trees', async () => {
        const comp = shallow(<TreesSelectorField trees={trees} />);

        expect(comp.find('FormDropdown').prop('options')).toHaveLength(2);
    });

    test('Render Loading', async () => {
        const comp = shallow(<TreesSelectorField loading trees={[]} />);

        expect(comp.find('Loading')).toHaveLength(1);
    });

    test('Pass value down to dropdown', async () => {
        const comp = shallow(<TreesSelectorField trees={trees} value={['attr2']} />);

        expect(comp.find('FormDropdown').props().value).toHaveLength(1);
        expect(comp.find('FormDropdown').props().value![0]).toBe('attr2');
    });
});
