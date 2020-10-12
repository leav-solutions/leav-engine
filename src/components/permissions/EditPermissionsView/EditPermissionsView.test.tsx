import {shallow} from 'enzyme';
import React from 'react';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import EditPermissionsView from './EditPermissionsView';

describe('EditPermissionsView', () => {
    test('Show permissions selector', async () => {
        const onChange = jest.fn();

        const comp = shallow(
            <EditPermissionsView
                onChange={onChange}
                permissions={[
                    {name: PermissionsActions.create_record, allowed: true},
                    {name: PermissionsActions.edit_record, allowed: true}
                ]}
                heritedPermissions={[
                    {name: PermissionsActions.create_record, allowed: false},
                    {name: PermissionsActions.edit_record, allowed: false}
                ]}
            />
        );

        // const forbidColor = comp.find('Icon[name="ban"]').prop('style')!.color;
        // const allowColor = comp.find('Icon[name="checkmark"]').prop('style')!.color;

        expect(comp.find('PermissionSelector')).toHaveLength(2);
        expect(
            comp
                .find('PermissionSelector')
                .first()
                .prop('forbiddenColor')
        ).toBe('#FF0000');
        expect(
            comp
                .find('PermissionSelector')
                .first()
                .prop('allowedColor')
        ).toBe('#99cc00');
    });
});
