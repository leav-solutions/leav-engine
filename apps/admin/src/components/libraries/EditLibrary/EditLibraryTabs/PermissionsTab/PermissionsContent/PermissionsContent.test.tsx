// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {GET_LIB_BY_ID_libraries_list} from '../../../../../../_gqlTypes/GET_LIB_BY_ID';
import {PermissionsRelation} from '../../../../../../_gqlTypes/globalTypes';
import {mockAttrTree} from '../../../../../../__mocks__/attributes';
import {mockLibrary} from '../../../../../../__mocks__/libraries';
import PermissionsContent from './PermissionsContent';

jest.mock('../../../../../../hooks/useLang');

jest.mock('../../../../../permissions/DefinePermByUserGroupView', () => function DefinePermByUserGroupView() {
        return <div>DefinePermByUserGroupView</div>;
    });

jest.mock('../../../../../permissions/DefineTreePermissionsView', () => function DefineTreePermissionsView() {
        return <div>DefineTreePermissionsView</div>;
    });

describe('PermissionsContent', () => {
    const library: GET_LIB_BY_ID_libraries_list = {
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

    test('Display 1 tab per tree + "library" tab', async () => {
        const comp = shallow(<PermissionsContent library={library} readonly={false} onSubmitSettings={onSubmit} />);

        expect(comp.find('Tab').prop('panes')).toHaveLength(3);
    });
});
