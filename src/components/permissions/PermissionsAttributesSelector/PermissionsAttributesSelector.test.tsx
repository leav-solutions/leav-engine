// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import '@testing-library/jest-dom/extend-expect';
import {shallow} from 'enzyme';
import React from 'react';
import {PermissionsRelation} from '../../../_gqlTypes/globalTypes';
import PermissionsAttributesSelector from './PermissionsAttributesSelector';

jest.mock('../../../hooks/useLang');

describe('PermissionsAttributesSelector', () => {
    const mockAttributes = [
        {
            id: 'attr1',
            label: {fr: 'Attribute 1'}
        },
        {
            id: 'attr2',
            label: {fr: 'Attribute 2'}
        }
    ];

    const handleSubmit = jest.fn();

    test('Display form for empty conf', async () => {
        const comp = shallow(
            <PermissionsAttributesSelector
                attributes={mockAttributes}
                onSubmitSettings={handleSubmit}
                permissionsConf={null}
                readonly={false}
            />
        );

        expect(comp.find('input[name="relation"]')).toHaveLength(0);
        expect(comp.find('[name="permissionTreeAttributes"]').prop('value')).toHaveLength(0);
    });

    test('Display selected values for attributes and relation', async () => {
        const comp = shallow(
            <PermissionsAttributesSelector
                attributes={mockAttributes}
                onSubmitSettings={handleSubmit}
                permissionsConf={{
                    permissionTreeAttributes: ['attr1', 'attr2'],
                    relation: PermissionsRelation.or
                }}
                readonly={false}
            />
        );

        expect(comp.find('[name="relation"]')).toHaveLength(Object.keys(PermissionsRelation).length);
        expect(comp.find('[data-test-id="relation-or"]').prop('checked')).toBe(true);
        expect(comp.find('[name="permissionTreeAttributes"]').prop('value')).toEqual(['attr1', 'attr2']);
        expect(comp.find('[name="permissionTreeAttributes"]').prop('value')).toEqual(['attr1', 'attr2']);
    });

    test('Hide relation selection if only 1 attribute is selected', async () => {
        const comp = shallow(
            <PermissionsAttributesSelector
                attributes={mockAttributes}
                onSubmitSettings={handleSubmit}
                permissionsConf={{
                    permissionTreeAttributes: ['attr1'],
                    relation: PermissionsRelation.or
                }}
                readonly={false}
            />
        );

        expect(comp.find('[name="relation"]')).toHaveLength(0);
    });

    test('If readonly, cannot edit conf', async () => {
        const comp = shallow(
            <PermissionsAttributesSelector
                attributes={mockAttributes}
                onSubmitSettings={handleSubmit}
                permissionsConf={{
                    permissionTreeAttributes: ['attr1', 'attr2'],
                    relation: PermissionsRelation.or
                }}
                readonly
            />
        );

        expect(
            comp
                .find('[name="relation"]')
                .first()
                .prop('disabled')
        ).toBe(true);
        expect(comp.find('[name="permissionTreeAttributes"]').prop('disabled')).toBe(true);
    });

    test('Calls onSubmit function', async () => {
        const comp = shallow(
            <PermissionsAttributesSelector
                attributes={mockAttributes}
                onSubmitSettings={handleSubmit}
                permissionsConf={{
                    permissionTreeAttributes: ['attr1', 'attr2'],
                    relation: PermissionsRelation.or
                }}
                readonly={false}
            />
        );

        comp.find('[name="permissions-conf-form"]').simulate('submit');

        expect(handleSubmit).toBeCalled();
    });
});
