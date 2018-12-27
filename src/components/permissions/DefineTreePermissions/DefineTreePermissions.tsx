import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Tab} from 'semantic-ui-react';
import {localizedLabel} from 'src/utils/utils';
import {GET_LIBRARIES_libraries_permissionsConf} from 'src/_gqlTypes/GET_LIBRARIES';
import {PermissionTypes} from 'src/_gqlTypes/globalTypes';
import DefineTreePermissionsView from '../DefineTreePermissionsView';

interface IDefineTreePermissionsProps extends WithNamespaces {
    permissionType: PermissionTypes;
    applyTo: string;
    permissionsConf: GET_LIBRARIES_libraries_permissionsConf;
}

function DefineTreePermissions({
    permissionsConf,
    permissionType,
    applyTo,
    i18n
}: IDefineTreePermissionsProps): JSX.Element {
    const _savePermission = data => {
        console.log('data :', data);
    };

    const panes = permissionsConf.permissionTreeAttributes.map(a => ({
        key: a.id,
        menuItem: localizedLabel(a.label, i18n),
        render: () => (
            <Tab.Pane key={a.id} className="grow flex-col">
                {a.linked_tree ? (
                    <DefineTreePermissionsView
                        key={a.id}
                        treeAttribute={a}
                        onSavePermissions={_savePermission}
                        permissionType={permissionType}
                        applyTo={applyTo}
                    />
                ) : (
                    <p>Missing tree ID</p>
                )}
            </Tab.Pane>
        )
    }));

    return <Tab panes={panes} className="grow flex-col" />;
}

export default withNamespaces()(DefineTreePermissions);
