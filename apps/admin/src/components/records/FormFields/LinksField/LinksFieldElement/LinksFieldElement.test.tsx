// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {ILinkValue} from '../../../../../_types/records';
import LinksFieldElement from './LinksFieldElement';

jest.mock('../../../../shared/RecordCard', () => function RecordCard() {
        return <div data-test-id="record_card" />;
    });

jest.mock('../../../EditRecordModal', () => function EditRecordModal() {
        return <div data-test-id="edit_record_modal" />;
    });

describe('EditRecordFormLinksElement', () => {
    const onDelete = jest.fn();
    const mockValue: ILinkValue = {
        id_value: '98765',
        linkValue: {
            id: '1',
            whoAmI: {
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
            }
        },
        modified_at: 1234567890,
        created_at: 1234567890,
        version: null
    };

    test('Display record data', async () => {
        const comp = shallow(<LinksFieldElement value={mockValue} onDeleteLink={onDelete} />);

        expect(comp.find('RecordCard')).toHaveLength(1);
    });

    test('Display menu on hover', async () => {
        const comp = shallow(<LinksFieldElement value={mockValue} onDeleteLink={onDelete} />);

        comp.find('[data-test-id="link_element_wrapper"]').simulate('mouseEnter');
        expect(comp.find('[data-test-id="link_element_hover_menu"]')).toHaveLength(1);

        comp.find('[data-test-id="link_element_wrapper"]').simulate('mouseLeave');
        expect(comp.find('[data-test-id="link_element_hover_menu"]')).toHaveLength(0);
    });

    test('Open record edition in modal', async () => {
        const comp = shallow(<LinksFieldElement value={mockValue} onDeleteLink={onDelete} />);

        comp.find('[data-test-id="link_element_wrapper"]').simulate('mouseEnter');
        comp.find('[data-test-id="edit_record_btn"]').simulate('click');

        expect(comp.find('EditRecordModal').prop('open')).toBe(true);
    });

    test('Delete element', async () => {
        const comp = shallow(<LinksFieldElement value={mockValue} onDeleteLink={onDelete} />);

        comp.find('[data-test-id="link_element_wrapper"]').simulate('mouseEnter');
        comp.find('[data-test-id="delete_link_btn"]').simulate('click');

        expect(comp.find('[data-test-id="delete_confirm_modal"]').prop('open')).toBe(true);

        const onDeleteConfirmFunc: () => any = comp.find('[data-test-id="delete_confirm_modal"]').prop('onConfirm');

        if (onDeleteConfirmFunc) {
            onDeleteConfirmFunc();
        }

        expect(onDelete).toBeCalled();
    });
});
