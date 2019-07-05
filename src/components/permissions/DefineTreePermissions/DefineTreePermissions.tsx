import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Tab} from 'semantic-ui-react';
import {localizedLabel} from '../../../utils/utils';
import {GET_LIBRARIES_libraries_permissions_conf} from '../../../_gqlTypes/GET_LIBRARIES';
import {PermissionTypes} from '../../../_gqlTypes/globalTypes';
import DefineTreePermissionsView from '../DefineTreePermissionsView';

interface IDefineTreePermissionsProps extends WithNamespaces {
    permissionType: PermissionTypes;
    applyTo: string;
    permissions_conf: GET_LIBRARIES_libraries_permissions_conf;
}

function DefineTreePermissions({
    permissions_conf,
    permissionType,
    applyTo,
    i18n
}: IDefineTreePermissionsProps): JSX.Element {
    const panes = permissions_conf.permissionTreeAttributes.map(a => ({
        key: a.id,
        menuItem: localizedLabel(a.label, i18n),
        render: () => (
            <Tab.Pane key={a.id} className="grow flex-col height100">
                {a.linked_tree ? (
                    <DefineTreePermissionsView
                        key={a.id}
                        treeAttribute={a}
                        permissionType={permissionType}
                        applyTo={applyTo}
                    />
                ) : (
                    <p>Missing tree ID</p>
                )}
            </Tab.Pane>
        )
    }));

    return <Tab panes={panes} className="grow flex-col height100" />;
}

export default withNamespaces()(DefineTreePermissions);
