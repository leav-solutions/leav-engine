// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {mockTreeWithPermConf} from '../../../../../../../__mocks__/trees';
import NodePermissionTabContent from './NodePermissionTabContent';

jest.mock('../../../../../../permissions/PermissionsAttributesSelector', () => {
    return function PermissionsAttributesSelector() {
        return <div>PermissionsAttributesSelector</div>;
    };
});

jest.mock('../../../../../../permissions/DefineTreePermissionsView', () => {
    return function DefineTreePermissionsView() {
        return <div>DefineTreePermissionsView</div>;
    };
});

jest.mock('../../../../../../permissions/DefinePermByUserGroupView', () => {
    return function DefinePermByUserGroupView() {
        return <div>DefinePermByUserGroupView</div>;
    };
});

jest.mock('../../../../../../../hooks/useLang');

describe('NodePermissionTabContent', () => {
    const onSubmit = jest.fn();

    test('Snapshot test', async () => {
        const comp = render(
            <NodePermissionTabContent
                tree={{...mockTreeWithPermConf}}
                library={{...mockTreeWithPermConf.libraries[0]}}
                onSubmitSettings={onSubmit}
                readonly={false}
            />
        );

        expect(comp).toMatchSnapshot();
    });
});
