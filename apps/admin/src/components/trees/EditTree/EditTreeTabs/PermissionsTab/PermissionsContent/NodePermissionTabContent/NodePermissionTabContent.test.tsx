// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {mockTreeWithPermConf} from '../../../../../../../__mocks__/trees';
import NodePermissionTabContent from './NodePermissionTabContent';

jest.mock('../../../../../../permissions/DefineTreePermissionsView', () => function DefineTreePermissionsView() {
        return <div>DefineTreePermissionsView</div>;
    });

jest.mock('../../../../../../permissions/DefinePermByUserGroupView', () => function DefinePermByUserGroupView() {
        return <div>DefinePermByUserGroupView</div>;
    });

jest.mock('../../../../../../../hooks/useLang');

describe('NodePermissionTabContent', () => {
    const onSubmit = jest.fn();

    test('Snapshot test', async () => {
        const comp = render(
            <NodePermissionTabContent
                tree={{...mockTreeWithPermConf}}
                treeLibraries={{...mockTreeWithPermConf.libraries[0]}}
                onSubmitSettings={onSubmit}
                readonly={false}
            />
        );

        expect(comp).toMatchSnapshot();
    });
});
