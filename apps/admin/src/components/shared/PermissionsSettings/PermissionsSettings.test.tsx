// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {getAttributesQuery} from 'queries/attributes/getAttributesQuery';
import React from 'react';
import {GET_LIB_BY_ID_libraries_list_permissions_conf} from '_gqlTypes/GET_LIB_BY_ID';
import {AttributeType, PermissionsRelation} from '_gqlTypes/globalTypes';
import {act, render, screen, within} from '_tests/testUtils';
import {mockAttrTree} from '__mocks__/attributes';
import PermissionsSettings from './PermissionsSettings';

export {};

describe('PermissionsSettings', () => {
    const permissionsSettings: GET_LIB_BY_ID_libraries_list_permissions_conf = {
        permissionTreeAttributes: [
            {
                ...mockAttrTree,
                id: 'permAttribute1',
                label: {fr: 'Attribut 1', en: 'Attribute 1'}
            },
            {
                ...mockAttrTree,
                id: 'permAttribute2',
                label: {fr: 'Attribut 2', en: 'Attribute 2'}
            }
        ],
        relation: PermissionsRelation.and
    };

    const _showPopup = async () => {
        await act(async () => {
            userEvent.click(screen.getByText('permissions_settings.title'));
        });
    };

    const _handleChangeSettings = jest.fn();

    beforeEach(() => jest.clearAllMocks());

    test('Display permissions attributes and operator', async () => {
        render(
            <PermissionsSettings
                readonly={false}
                permissionsSettings={permissionsSettings}
                onChangeSettings={jest.fn()}
            />
        );

        await _showPopup();

        expect(screen.getByText(permissionsSettings.permissionTreeAttributes[0].label.fr)).toBeInTheDocument();
        expect(screen.getByText(permissionsSettings.permissionTreeAttributes[1].label.fr)).toBeInTheDocument();

        expect(screen.getByRole('button', {name: /and/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /and/})).toHaveClass('active');
    });

    test('Can add a permission attribute', async () => {
        const mocks = [
            {
                request: {
                    query: getAttributesQuery,
                    variables: {
                        libraries: null,
                        type: [AttributeType.tree]
                    }
                },
                result: {
                    data: {
                        attributes: {
                            __typename: 'AttributesList',
                            totalCount: 1,
                            list: [
                                {
                                    ...mockAttrTree,
                                    __typename: 'Attribute',
                                    id: 'permAttribute3',
                                    label: {fr: 'Attribut 3', en: 'Attribute 3'}
                                }
                            ]
                        }
                    }
                }
            }
        ];

        render(
            <PermissionsSettings
                readonly={false}
                permissionsSettings={permissionsSettings}
                onChangeSettings={_handleChangeSettings}
            />,
            {
                apolloMocks: mocks
            }
        );

        await _showPopup();

        userEvent.click(screen.getByRole('button', {name: /add/}));

        const attributeSelectionList = await screen.findByRole('list', {name: /attribute-selector-list/});
        expect(attributeSelectionList).toBeInTheDocument();

        const loadedAttribute = await within(attributeSelectionList).findByText('Attribut 3');
        expect(loadedAttribute).toBeInTheDocument();
        userEvent.click(loadedAttribute);

        expect(_handleChangeSettings).toBeCalled();
    });

    test('Can remove a permission attribute', async () => {
        render(
            <PermissionsSettings
                readonly={false}
                permissionsSettings={permissionsSettings}
                onChangeSettings={_handleChangeSettings}
            />
        );

        await _showPopup();

        userEvent.click(screen.getAllByRole('button', {name: /remove/})[0]);
        expect(_handleChangeSettings).toHaveBeenCalledWith({
            ...permissionsSettings,
            permissionTreeAttributes: [permissionsSettings.permissionTreeAttributes[1].id]
        });
    });

    test('Can change operator', async () => {
        render(
            <PermissionsSettings
                readonly={false}
                permissionsSettings={permissionsSettings}
                onChangeSettings={_handleChangeSettings}
            />
        );

        await _showPopup();

        await act(async () => {
            userEvent.click(screen.getByRole('button', {name: /operator_or/}));
        });

        expect(_handleChangeSettings).toHaveBeenCalledWith({
            permissionTreeAttributes: permissionsSettings.permissionTreeAttributes.map(a => a.id),
            relation: PermissionsRelation.or
        });
    });

    test('If read only, cannot edit settings', async () => {
        render(
            <PermissionsSettings
                readonly={true}
                permissionsSettings={permissionsSettings}
                onChangeSettings={jest.fn()}
            />
        );

        await _showPopup();

        expect(screen.queryByRole('button', {name: /remove/})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /add/})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /operator_and/})).toBeDisabled();
        expect(screen.queryByRole('button', {name: /operator_or/})).toBeDisabled();
    });
});
