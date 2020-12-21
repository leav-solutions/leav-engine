// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {wait} from '@apollo/react-testing';
import {shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {ILinkValuesList} from '../../../../../../../_types/attributes';
import LinkValuesList from './LinkValuesList';

jest.mock(
    '../../../../../../records/SelectRecordModal',
    () =>
        function SelectRecordModal() {
            return <div>SelectRecordModal</div>;
        }
);

jest.mock(
    '../../../../../../records/EditRecordModal',
    () =>
        function EditRecordModal() {
            return <div>EditRecordModal</div>;
        }
);

jest.mock(
    '../../../../../../shared/RecordCard',
    () =>
        function RecordCard() {
            return <div>RecordCard</div>;
        }
);

describe('LinkValuesList', () => {
    const onValuesUpdate = jest.fn();
    const baseWhoAmI = {
        id: '132456',
        label: 'My record',
        preview: null,
        color: null,
        library: {id: 'test_lib', label: {fr: 'Test Lib'}}
    };

    const mockValues: ILinkValuesList[] = [
        {
            whoAmI: {
                ...baseWhoAmI,
                id: '132456'
            }
        },
        {
            whoAmI: {
                ...baseWhoAmI,
                id: '132457'
            }
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Render existing list', async () => {
        const comp = shallow(
            <LinkValuesList values={mockValues} onValuesUpdate={onValuesUpdate} linkedLibrary="test_lib" />
        );

        expect(comp.find('[data-test-id="values-list-value"]')).toHaveLength(2);
    });

    test('Open record creation modal', async () => {
        const comp = shallow(
            <LinkValuesList values={mockValues} onValuesUpdate={onValuesUpdate} linkedLibrary="test_lib" />
        );

        act(() => {
            comp.find('Button[data-test-id="open-create-record"]').simulate('click');
        });

        const editRecordComp = comp.find('EditRecordModal');
        expect(editRecordComp.prop('open')).toBe(true);
        expect(editRecordComp.prop('recordId')).toBeUndefined();

        act(() => {
            const onCloseFunc: any = editRecordComp.prop('onClose');

            if (onCloseFunc) {
                onCloseFunc({
                    whoAmI: {
                        ...baseWhoAmI,
                        id: '99999'
                    }
                });
            }
        });

        await wait(0);

        expect(onValuesUpdate).toBeCalled();
        expect(onValuesUpdate.mock.calls[0][0]).toHaveLength(3);
    });

    test("When selecting a record, don't add a record already present in values", async () => {
        const comp = shallow(
            <LinkValuesList values={mockValues} onValuesUpdate={onValuesUpdate} linkedLibrary="test_lib" />
        );

        act(() => {
            comp.find('Button[data-test-id="open-select-record"]').simulate('click');
        });

        const selectRecordComp = comp.find('SelectRecordModal');
        expect(selectRecordComp.prop('open')).toBe(true);

        act(() => {
            const onSelectFunc: any = selectRecordComp.prop('onSelect');

            if (onSelectFunc) {
                onSelectFunc({
                    ...baseWhoAmI,
                    id: '132456'
                });
            }
        });

        await wait(0);

        expect(onValuesUpdate).not.toBeCalled();
    });

    test('Delete a value', async () => {
        const comp = shallow(
            <LinkValuesList values={mockValues} onValuesUpdate={onValuesUpdate} linkedLibrary="test_lib" />
        );

        act(() => {
            comp.find('Button[data-test-id="link-value-delete-btn"]')
                .first()
                .simulate('click', {stopPropagation: jest.fn(), preventDefault: jest.fn()});
        });

        expect(onValuesUpdate).toBeCalled();
        expect(onValuesUpdate.mock.calls[0][0]).toHaveLength(1);
    });

    test('Edit record when clicking on a value', async () => {
        const comp = shallow(
            <LinkValuesList values={mockValues} onValuesUpdate={onValuesUpdate} linkedLibrary="test_lib" />
        );

        act(() => {
            comp.find('[data-test-id="values-list-value"]')
                .first()
                .simulate('click');
        });

        const editRecordComp = comp.find('EditRecordModal');
        expect(editRecordComp.prop('open')).toBe(true);
        expect(editRecordComp.prop('recordId')).toBe('132456');
    });
});
