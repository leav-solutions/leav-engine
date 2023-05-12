// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
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
    const attribute = {
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

    test('Display 1 tab per tree', async () => {
        const comp = shallow(<PermissionsContent attribute={attribute} readonly={false} onSubmitSettings={onSubmit} />);

        expect(comp.find('Tab').prop('panes')).toHaveLength(3);
    });
});
