// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import PermissionsAllowedIcon from 'components/shared/icons/PermissionsAllowedIcon';
import PermissionsForbiddenIcon from 'components/shared/icons/PermissionsForbiddenIcon';
import PermissionsInheritIcon from 'components/shared/icons/PermissionsInheritIcon';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import useLang from '../../../../hooks/useLang';
import {localizedLabel} from '../../../../utils';
import {GET_PERMISSIONS_inheritPerm, GET_PERMISSIONS_perm} from '../../../../_gqlTypes/GET_PERMISSIONS';
import {GET_PERMISSIONS_ACTIONS_permissionsActionsByType} from '../../../../_gqlTypes/GET_PERMISSIONS_ACTIONS';
import {SAVE_PERMISSION_savePermission_actions} from '../../../../_gqlTypes/SAVE_PERMISSION';
import {IKeyValue} from '../../../../_types/shared';
import PermissionSelector from './PermissionSelector';

interface IEditPermissionsViewProps {
    permissions: GET_PERMISSIONS_perm[];
    actions: GET_PERMISSIONS_ACTIONS_permissionsActionsByType[];
    inheritedPermissions: GET_PERMISSIONS_inheritPerm[];
    onChange: (permToSave: SAVE_PERMISSION_savePermission_actions) => Promise<void>;
    readOnly?: boolean;
}

const permissionForbiddenColor = '#FF0000';
const permissionAllowedColor = '#99cc00';

const PermissionsHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const EditPermissionsView = ({
    permissions,
    actions,
    inheritedPermissions,
    onChange,
    readOnly = false
}: IEditPermissionsViewProps): JSX.Element => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const permissionsByName: IKeyValue<boolean | null> = permissions.reduce(
        (perms, perm) => ({
            ...perms,
            [perm.name]: perm.allowed
        }),
        {}
    );

    const heritPermByName: IKeyValue<boolean> = inheritedPermissions.reduce(
        (heritPerms, p) => ({...heritPerms, [p.name]: p.allowed}),
        {}
    );

    return (
        <>
            <Header as="h4">{t('permissions.permission_col_name')}</Header>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={10}></Table.HeaderCell>
                        <Table.HeaderCell width={6}>
                            <PermissionsHeader>
                                <PermissionsForbiddenIcon />
                                <PermissionsInheritIcon />
                                <PermissionsAllowedIcon />
                            </PermissionsHeader>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {actions.map(a => {
                        if (typeof permissionsByName[a.name] === undefined) {
                            return null;
                        }

                        const _onPermUpdate = (permVal: boolean | null) => onChange({name: a.name, allowed: permVal});

                        return (
                            <Table.Row key={a.name}>
                                <Table.Cell>
                                    <p>{localizedLabel(a.label, lang)}</p>
                                </Table.Cell>
                                <PermissionSelector
                                    as={Table.Cell}
                                    value={permissionsByName[a.name] ?? null}
                                    inheritValue={heritPermByName[a.name]}
                                    onChange={_onPermUpdate}
                                    forbiddenColor={permissionForbiddenColor}
                                    allowedColor={permissionAllowedColor}
                                    readOnly={readOnly}
                                />
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>
        </>
    );
};

export default EditPermissionsView;
