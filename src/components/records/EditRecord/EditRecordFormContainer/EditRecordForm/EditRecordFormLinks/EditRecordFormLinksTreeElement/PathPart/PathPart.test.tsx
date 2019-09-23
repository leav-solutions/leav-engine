import {shallow} from 'enzyme';
import React from 'react';
import PathPart from './PathPart';

jest.mock('../../../../../../../shared/RecordCard', () => {
    return function RecordCard({record}) {
        return <div data-test-id={`record_card_${record.id}`} />;
    };
});

jest.mock('../../../../../../EditRecordModal', () => {
    return function EditRecordModal({record}) {
        return <div data-test-id="edit_record_modal" />;
    };
});

jest.mock('../../../../../../../shared/ConfirmedButton', () => {
    return function ConfirmedButton() {
        return <div data-test-id="confirmed_button" />;
    };
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

    test('Show menu on hover', async () => {
        const comp = shallow(<PathPart record={record} />);

        comp.find('[data-test-id="path_part_wrapper"]').simulate('mouseEnter');
        expect(comp.find('[data-test-id="edit_tree_link_btn"]')).toHaveLength(1);
    });

    test('Open edit record modal', async () => {
        const comp = shallow(<PathPart record={record} />);

        comp.find('[data-test-id="path_part_wrapper"]').simulate('mouseEnter');
        comp.find('[data-test-id="edit_tree_link_btn"]').simulate('click');

        expect(comp.find('EditRecordModal')).toHaveLength(1);
    });

    test('Show delete button if deleteable on edit', async () => {
        const onDelete = jest.fn();
        const comp = shallow(<PathPart record={record} deletable onDelete={onDelete} />);

        comp.find('[data-test-id="path_part_wrapper"]').simulate('mouseEnter');
        expect(comp.find('[data-test-id="delete_tree_link_btn"]')).toHaveLength(1);
    });
});
