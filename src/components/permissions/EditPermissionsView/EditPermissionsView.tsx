import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Icon, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_PERMISSIONS_heritPerm, GET_PERMISSIONS_perm} from '../../../_gqlTypes/GET_PERMISSIONS';
import {SAVE_PERMISSION_savePermission_actions} from '../../../_gqlTypes/SAVE_PERMISSION';
import PermissionSelector from '../PermissionSelector';

interface IEditPermissionsViewProps extends WithNamespaces {
    permissions: GET_PERMISSIONS_perm[];
    heritedPermissions: GET_PERMISSIONS_heritPerm[];
    onChange: (permToSave: SAVE_PERMISSION_savePermission_actions) => void;
    readOnly?: boolean;
}

const permissionForbiddenColor = '#FF0000';
const permissionAllowedColor = '#99cc00';

/* tslint:disable-next-line:variable-name */
const ForbiddenIcon = styled(Icon)`
    color: ${permissionForbiddenColor};
`;

/* tslint:disable-next-line:variable-name */
const AllowedIcon = styled(Icon)`
    color: ${permissionAllowedColor};
`;

/* tslint:disable-next-line:variable-name */
const PermissionsHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

function EditPermissionsView({
    permissions,
    heritedPermissions,
    onChange,
    readOnly,
    t
}: IEditPermissionsViewProps): JSX.Element {
    const heritPermByName = heritedPermissions.reduce((heritPerms, p) => {
        heritPerms[p.name] = p.allowed;

        return heritPerms;
    }, {});

    return (
        <Table celled>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>{t('permissions.permission_col_name')}</Table.HeaderCell>
                    <Table.HeaderCell>
                        <PermissionsHeader>
                            <ForbiddenIcon name="ban" />
                            <Icon name="sitemap" />
                            <AllowedIcon name="checkmark" />
                        </PermissionsHeader>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {permissions.map(p => {
                    if (!p) {
                        return null;
                    }

                    const _onPermUpdate = (permVal: boolean | null) => onChange({name: p.name, allowed: permVal});

                    return (
                        <Table.Row key={p.name}>
                            <Table.Cell>
                                <p>{t('permissions.' + p.name)}</p>
                            </Table.Cell>
                            <PermissionSelector
                                as={Table.Cell}
                                value={p.allowed}
                                heritValue={heritPermByName[p.name]}
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
    );
}
EditPermissionsView.defaultProps = {
    readOnly: false
};

export default withNamespaces()(EditPermissionsView);
