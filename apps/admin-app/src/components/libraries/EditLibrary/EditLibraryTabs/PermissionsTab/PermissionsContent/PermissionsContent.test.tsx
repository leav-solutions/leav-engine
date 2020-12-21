// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount, shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {GET_LIBRARIES_libraries_list} from '../../../../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsRelation} from '../../../../../../_gqlTypes/globalTypes';
import {mockAttrTree} from '../../../../../../__mocks__/attributes';
import {mockLibrary} from '../../../../../../__mocks__/libraries';
import PermissionsContent from './PermissionsContent';

jest.mock('../../../../../../hooks/useLang');

jest.mock('../../../../../permissions/DefinePermByUserGroupView', () => {
    return function DefinePermByUserGroupView() {
        return <div>DefinePermByUserGroupView</div>;
    };
});

jest.mock('../../../../../permissions/DefineTreePermissionsView', () => {
    return function DefineTreePermissionsView() {
        return <div>DefineTreePermissionsView</div>;
    };
});

describe('PermissionsContent', () => {
    const library: GET_LIBRARIES_libraries_list = {
        ...mockLibrary,
        label: {fr: 'Test 1', en: null},
        permissions_conf: {
            permissionTreeAttributes: [
                {...mockAttrTree, id: 'tree1'},
                {
                    ...mockAttrTree,
                    id: 'tree2',
                    label: {
                        fr: 'Mon Attribut2'
                    }
                }
            ],
            relation: PermissionsRelation.and
        }
    };
    const onSubmit = jest.fn();

    test('If readonly, cannot edit settings', async () => {
        const comp = shallow(<PermissionsContent library={library} readonly onSubmitSettings={onSubmit} />);

        expect(comp.find('FormDropdown[name="permissionTreeAttributes"]').prop('disabled')).toBe(true);
    });

    test('Display 1 tab per tree + "library" tab', async () => {
        const comp = shallow(<PermissionsContent library={library} readonly={false} onSubmitSettings={onSubmit} />);

        expect(comp.find('Tab').prop('panes')).toHaveLength(3);
    });

    test('Calls submit function', async () => {
        const comp = mount(<PermissionsContent library={library} readonly={false} onSubmitSettings={onSubmit} />);

        await act(async () => {
            comp.find('form').simulate('submit');
        });

        expect(onSubmit).toBeCalled();
    });
});
