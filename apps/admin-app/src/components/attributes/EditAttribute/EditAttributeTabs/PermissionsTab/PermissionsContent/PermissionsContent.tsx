// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import PermissionsSettings from 'components/shared/PermissionsSettings';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Tab} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import useLang from '../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../utils';
import {GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute} from '../../../../../../_gqlTypes/GET_LIB_BY_ID';
import {PermissionsRelation, PermissionTypes, Treepermissions_confInput} from '../../../../../../_gqlTypes/globalTypes';
import DefinePermByUserGroupView from '../../../../../permissions/DefinePermByUserGroupView';
import DefineTreePermissionsView from '../../../../../permissions/DefineTreePermissionsView';

interface IPermissionsContentProps {
    attribute: GET_ATTRIBUTE_BY_ID_attributes_list;
    onSubmitSettings: (conf: Treepermissions_confInput) => void;
    readonly: boolean;
}

const PermissionsSettingsBtn = styled(PermissionsSettings)`
    position: absolute;
    top: 2rem;
    right: 2rem;
`;

function PermissionsContent({attribute, onSubmitSettings, readonly}: IPermissionsContentProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const defaultPermsConf = {permissionTreeAttributes: [], relation: PermissionsRelation.and};

    const _handleChangeSettings = (settings: Treepermissions_confInput) => {
        onSubmitSettings(settings);
    };

    const permsConf = attribute.permissions_conf || defaultPermsConf;
    const panes = permsConf.permissionTreeAttributes.map(a => ({
        key: a.id,
        menuItem: localizedLabel(a.label, lang),
        render: () => (
            <Tab.Pane key={a.id} className="grow">
                {((a as unknown) as GET_LIB_BY_ID_libraries_list_permissions_conf_permissionTreeAttributes_TreeAttribute)
                    .linked_tree ? (
                    <DefineTreePermissionsView
                        key={a.id}
                        treeAttribute={a}
                        permissionType={PermissionTypes.record_attribute}
                        applyTo={attribute.id}
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
        menuItem: t('permissions.attribute_tab_name'),
        render: () => (
            <Tab.Pane key="libPermissions" className="grow">
                {
                    <DefinePermByUserGroupView
                        type={PermissionTypes.attribute}
                        key="attrPermissions"
                        applyTo={attribute.id}
                        readOnly={readonly}
                    />
                }
            </Tab.Pane>
        )
    });

    return (
        <div className="flex-col height100">
            <PermissionsSettingsBtn
                permissionsSettings={attribute.permissions_conf}
                onChangeSettings={_handleChangeSettings}
                readonly={readonly}
            />
            <Tab panes={panes} className="grow flex-col height100" />
        </div>
    );
}

export default PermissionsContent;
