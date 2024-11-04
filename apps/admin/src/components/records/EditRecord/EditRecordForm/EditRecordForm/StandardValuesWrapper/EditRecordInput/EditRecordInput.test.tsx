// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {IValue} from '../../../../../../../_types/records';
import {mockAttrSimple} from '../../../../../../../__mocks__/attributes';
import EditRecordInput from './EditRecordInput';

describe('EditRecordInput', () => {
    const onSubmit = jest.fn();
    const onDelete = jest.fn();
    const onChange = jest.fn();
    const onCancel = jest.fn();

    const mockValue: IValue = {
        id_value: null,
        value: 'test_value',
        raw_value: 'test_value',
        version: null,
        created_at: 1234567890,
        modified_at: 1234567890
    };

    const mockAttribute = {
        ...mockAttrSimple,
        id: 'test_attr'
    };

    beforeEach(jest.clearAllMocks);

    test('Render a value', async () => {
        const comp = shallow(
            <EditRecordInput
                value={mockValue}
                readonly={false}
                attribute={mockAttribute}
                onSubmit={onSubmit}
                onDelete={onDelete}
                onChange={onChange}
                onCancel={onCancel}
            />
        );

        expect(comp.find('Input').prop('value')).toBe('test_value');
    });

    test('On change, calls onChange', async () => {
        const comp = shallow(
            <EditRecordInput
                value={mockValue}
                readonly={false}
                attribute={mockAttribute}
                onSubmit={onSubmit}
                onDelete={onDelete}
                onChange={onChange}
                onCancel={onCancel}
            />
        );

        const input = comp.find('Input');
        act(() => {
            input.simulate('focus');
            input.simulate('change', {target: {value: 'new_value'}});
        });

        expect(onChange).toBeCalled();
    });

    test('On click on "submit", submit value', async () => {
        const comp = shallow(
            <EditRecordInput
                value={mockValue}
                readonly={false}
                attribute={mockAttribute}
                onSubmit={onSubmit}
                onDelete={onDelete}
                onChange={onChange}
                onCancel={onCancel}
            />
        );

        const input = comp.find('Input');
        act(() => {
            input.simulate('focus');
            input.simulate('change', {target: {value: 'new_value'}});
        });

        const submitButton = comp.find('[data-test-id="submit-btn"]');
        submitButton.simulate('click');

        expect(onSubmit).toBeCalled();
    });

    test('On "enter", submit value', async () => {
        const comp = shallow(
            <EditRecordInput
                value={mockValue}
                readonly={false}
                attribute={mockAttribute}
                onSubmit={onSubmit}
                onDelete={onDelete}
                onChange={onChange}
                onCancel={onCancel}
            />
        );

        const input = comp.find('Input');
        act(() => {
            input.simulate('focus');
            input.simulate('change', {target: {value: 'new_value'}});
            input.simulate('keypress', {key: 'Enter', target: {blur: jest.fn()}});
        });

        expect(onSubmit).toBeCalled();
    });

    test('On click on "delete", calls onDelete', async () => {
        const comp = shallow(
            <EditRecordInput
                value={mockValue}
                readonly={false}
                attribute={mockAttribute}
                onSubmit={onSubmit}
                onDelete={onDelete}
                onChange={onChange}
                onCancel={onCancel}
            />
        );

        comp.find('Input').simulate('focus');
        comp.find('[data-test-id="delete-btn"]').simulate('click');

        expect(onDelete).toBeCalled();
    });

    test('On click on "cancel", calls onCancel', async () => {
        const comp = shallow(
            <EditRecordInput
                value={mockValue}
                readonly={false}
                attribute={mockAttribute}
                onSubmit={onSubmit}
                onDelete={onDelete}
                onChange={onChange}
                onCancel={onCancel}
            />
        );

        const input = comp.find('Input');
        act(() => {
            input.simulate('focus');
            input.simulate('change', {target: {value: 'new_value'}});
        });

        comp.find('[data-test-id="cancel-btn"]').simulate('click');

        expect(onCancel).toBeCalled();
    });
});
