// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import PermissionsSettings from 'components/shared/PermissionsSettings';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Tab} from 'semantic-ui-react';
import styled from 'styled-components';
import {IGroupedPermissionsActions} from '_types/permissions';
import useLang from '../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../utils';
import {
    GET_LIB_BY_ID_libraries_list,
    GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute
} from '../../../../../../_gqlTypes/GET_LIB_BY_ID';
import {
    PermissionsActions,
    PermissionsRelation,
    PermissionTypes,
    Treepermissions_confInput
} from '../../../../../../_gqlTypes/globalTypes';
import DefinePermByUserGroupView from '../../../../../permissions/DefinePermByUserGroupView';
import DefineTreePermissionsView from '../../../../../permissions/DefineTreePermissionsView';

const PermissionsSettingsBtn = styled(PermissionsSettings)`
    position: absolute;
    top: 2rem;
    right: 2rem;
`;

interface IPermissionsContentProps {
    library: GET_LIB_BY_ID_libraries_list;
    onSubmitSettings: (conf: Treepermissions_confInput) => void;
    readonly: boolean;
}

function PermissionsContent({library, onSubmitSettings, readonly}: IPermissionsContentProps): JSX.Element {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const defaultPermsConf = {permissionTreeAttributes: [], relation: PermissionsRelation.and};

    const groupedLibraryPermissions: IGroupedPermissionsActions = {
        library: [PermissionsActions.admin_library, PermissionsActions.access_library],
        entities: [
            PermissionsActions.access_record,
            PermissionsActions.create_record,
            PermissionsActions.edit_record,
            PermissionsActions.delete_record
        ]
    };

    const permsConf = library.permissions_conf || defaultPermsConf;
    const panes = permsConf.permissionTreeAttributes.map(a => ({
        key: a.id,
        menuItem: localizedLabel(a.label, availableLanguages),
        render: () => (
            <Tab.Pane key={a.id} className="grow flex-col height100">
                {(a as GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute)
                    .linked_tree ? (
                    <DefineTreePermissionsView
                        key={a.id}
                        treeAttribute={
                            a as GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute
                        }
                        permissionType={PermissionTypes.record}
                        applyTo={library.id}
                        readOnly={readonly}
                    />
                ) : (
                    <p>Missing tree ID</p>
                )}
            </Tab.Pane>
        )
    }));

    panes.unshift({
        key: 'libPermissions',
        menuItem: t('permissions.default'),
        render: () => (
            <Tab.Pane key="libPermissions" className="grow flex-col height100">
                <DefinePermByUserGroupView
                        type={PermissionTypes.library}
                        key="libPermissions"
                        actions={groupedLibraryPermissions}
                        applyTo={library.id}
                        readOnly={readonly}
                    />
            </Tab.Pane>
        )
    });

    const _handleChangeSettings = (settings: Treepermissions_confInput) => {
        onSubmitSettings(settings);
    };

    return (
        <div className="flex-col height100">
            <PermissionsSettingsBtn
                permissionsSettings={library.permissions_conf}
                onChangeSettings={_handleChangeSettings}
                library={library}
                readonly={readonly}
            />
            <Tab panes={panes} className="grow flex-col height100" />
        </div>
    );
}

export default PermissionsContent;
