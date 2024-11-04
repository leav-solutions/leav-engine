// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {mockTreeWithPermConf} from '../../../../../../__mocks__/trees';
import PermissionsContent from './PermissionsContent';

jest.mock('../../../../../../hooks/useLang');

jest.mock('../../../../../permissions/DefinePermByUserGroupView', () => function DefinePermByUserGroupView() {
        return <div>DefinePermByUserGroupView</div>;
    });

jest.mock('../../../../../permissions/DefineTreePermissionsView', () => function DefineTreePermissionsView() {
        return <div>DefineTreePermissionsView</div>;
    });

describe('PermissionsContent', () => {
    const onSubmit = jest.fn();

    test('Display 1 tab per library + "tree" tab', async () => {
        const comp = shallow(
            <PermissionsContent tree={{...mockTreeWithPermConf}} readonly={false} onSubmitSettings={onSubmit} />
        );

        expect(comp.find('Tab').prop('panes')).toHaveLength(3);
    });
});
