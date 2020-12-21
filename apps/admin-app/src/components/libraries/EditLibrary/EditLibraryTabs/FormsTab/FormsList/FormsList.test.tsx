// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount, shallow} from 'enzyme';
import React from 'react';
import {GET_FORMS_LIST_forms_list} from '../../../../../../_gqlTypes/GET_FORMS_LIST';
import {mockFormLight} from '../../../../../../__mocks__/forms';
import FormsList from './FormsList';

jest.mock('../../../../../../hooks/useLang');
jest.mock('../../../../../../hooks/useUserData');

jest.mock('../../../../../shared/ConfirmedButton', () => {
    return function ConfirmedButton() {
        return <div>ConfirmedButton</div>;
    };
});

describe('FormsList', () => {
    const forms = [
        {...mockFormLight, id: 'form1'},
        {...mockFormLight, id: 'form2'}
    ];
    const onRowClick = jest.fn();
    const onCreate = jest.fn();
    const onDelete = jest.fn();
    const onFiltersChange = jest.fn();

    let comp;
    beforeAll(() => {
        comp = shallow(
            <FormsList
                loading={false}
                libraryId="my_lib"
                forms={forms as GET_FORMS_LIST_forms_list[]}
                onRowClick={onRowClick}
                onCreate={onCreate}
                onDelete={onDelete}
                onFiltersChange={onFiltersChange}
            />
        );
    });

    test('Display list', async () => {
        expect(comp.find('[data-test-id="form-list-row"]')).toHaveLength(2);
    });

    test('Calls onCreate', async () => {
        comp.find('[data-test-id="create-form-btn"]').simulate('click');

        expect(onCreate).toBeCalled();
    });

    test('Calls onRowClick', async () => {
        comp.find('[data-test-id="form-list-row"]').first().simulate('click');

        expect(onRowClick).toBeCalled();
    });

    test('Call onFiltersChange', async () => {
        const mountedComp = mount(
            <FormsList
                loading={false}
                libraryId="my_lib"
                forms={forms as GET_FORMS_LIST_forms_list[]}
                onRowClick={onRowClick}
                onCreate={onCreate}
                onDelete={onDelete}
                onFiltersChange={onFiltersChange}
            />
        );
        mountedComp.find('.filters input[name="label"]').simulate('change', {target: {value: 'MyLabel'}});
        mountedComp.find('.filters input[name="id"]').simulate('change');
        mountedComp.find('.filters input[name="system"]').simulate('change');

        expect(onFiltersChange).toHaveBeenCalledTimes(3);
        expect(onFiltersChange.mock.calls[0][0]).toMatchObject({value: 'MyLabel'});
    });
});
