import {mount, shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../../_gqlTypes/GET_ATTRIBUTES';
import {PermissionsRelation} from '../../../../../../_gqlTypes/globalTypes';
import {mockAttrSimple, mockAttrTree} from '../../../../../../__mocks__/attributes';
import PermissionsContent from './PermissionsContent';

jest.mock('../../../../../../hooks/useLang');

jest.mock('../../../../../permissions/DefineTreePermissionsView', () => {
    return function DefineTreePermissionsView() {
        return <div>DefineTreePermissionsView</div>;
    };
});

jest.mock('../../../../../permissions/DefinePermByUserGroupView', () => {
    return function DefinePermByUserGroupView() {
        return <div>DefinePermByUserGroupView</div>;
    };
});

describe('PermissionsContent', () => {
    const mockTreeAttributes = [
        {...mockAttrTree, id: 'tree1', label: {fr: 'Tree Attr1'}},
        {...mockAttrTree, id: 'tree2', label: {fr: 'Tree Attr 2'}}
    ];
    const attribute: GET_ATTRIBUTES_attributes_list = {
        ...mockAttrSimple,
        label: {fr: 'Test 1', en: null},
        permissions_conf: {
            permissionTreeAttributes: [
                {...mockAttrTree, id: 'tree1'},
                {...mockAttrTree, id: 'tree2'}
            ],
            relation: PermissionsRelation.and
        }
    };
    const onSubmit = jest.fn();

    test('If readonly, cannot edit settings', async () => {
        const comp = shallow(
            <PermissionsContent
                attribute={attribute}
                treeAttributes={mockTreeAttributes}
                readonly
                onSubmitSettings={onSubmit}
            />
        );

        expect(comp.find('FormDropdown[name="permissionTreeAttributes"]').prop('disabled')).toBe(true);
    });

    test('Display 1 tab per tree', async () => {
        const comp = shallow(
            <PermissionsContent
                attribute={attribute}
                treeAttributes={mockTreeAttributes}
                readonly={false}
                onSubmitSettings={onSubmit}
            />
        );

        expect(comp.find('Tab').prop('panes')).toHaveLength(3);
    });

    test('Calls submit function', async () => {
        const comp = mount(
            <PermissionsContent
                attribute={attribute}
                treeAttributes={mockTreeAttributes}
                readonly={false}
                onSubmitSettings={onSubmit}
            />
        );

        await act(async () => {
            comp.find('form').simulate('submit');
        });

        expect(onSubmit).toBeCalled();
    });
});
