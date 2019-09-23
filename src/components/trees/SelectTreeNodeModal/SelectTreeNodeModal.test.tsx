import {wait} from '@apollo/react-testing';
import {shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import SelectTreeNodeModal from './SelectTreeNodeModal';

jest.mock(
    '../../trees/TreeStructure',
    () =>
        function TreeStructure() {
            return <div>Tree Structure</div>;
        }
);

describe('SelectTreeNodeModal', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    test('Display tree structure in a modal', async () => {
        const comp = shallow(<SelectTreeNodeModal tree="test_tree" onSelect={onSelect} open onClose={onClose} />);
        expect(comp.find('Modal').prop('open')).toBe(true);
        expect(comp.find('TreeStructure')).toHaveLength(1);
    });

    test('Calls onClose', async () => {
        const comp = shallow(<SelectTreeNodeModal tree="test_tree" onSelect={onSelect} open onClose={onClose} />);
        expect(comp.find('Modal').prop('open')).toBe(true);

        act(() => {
            comp.find('[data-test-id="select_tree_node_close_btn"]').simulate('click');
        });
        await wait(0);

        expect(onClose).toBeCalled();
    });
});
