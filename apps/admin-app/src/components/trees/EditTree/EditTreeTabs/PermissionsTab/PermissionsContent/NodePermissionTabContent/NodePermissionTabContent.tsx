// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import PermissionsSettings from 'components/shared/PermissionsSettings';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Tab} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_LIB_BY_ID_libraries_list} from '_gqlTypes/GET_LIB_BY_ID';
import useLang from '../../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../../utils';
import {
    GET_TREE_BY_ID_trees_list,
    GET_TREE_BY_ID_trees_list_libraries,
    GET_TREE_BY_ID_trees_list_permissions_conf_permissionsConf_permissionTreeAttributes_TreeAttribute
} from '../../../../../../../_gqlTypes/GET_TREE_BY_ID';
import {PermissionTypes,Treepermissions_confInput} from '../../../../../../../_gqlTypes/globalTypes';
import DefinePermByUserGroupView from '../../../../../../permissions/DefinePermByUserGroupView';
import DefineTreePermissionsView from '../../../../../../permissions/DefineTreePermissionsView';

const PermissionsSettingsBtn = styled(PermissionsSettings)`
    position: absolute;
    top: 2rem;
    right: 2rem;
`;

interface INodePermissionTabContentProps {
    tree: GET_TREE_BY_ID_trees_list;
    treeLibraries: GET_TREE_BY_ID_trees_list_libraries;
    onSubmitSettings: (library: string, conf: Treepermissions_confInput) => void;
    readonly: boolean;
}

function NodePermissionTabContent({
    readonly,
    treeLibraries,
    tree,
    onSubmitSettings
}: INodePermissionTabContentProps): JSX.Element {
    const {lang} = useLang();
    const {t} = useTranslation();
    const _handleChangeSettings = (conf: Treepermissions_confInput) => onSubmitSettings(treeLibraries.library.id, conf);

    const treePermsConf =
        tree.permissions_conf?.filter(p => p.libraryId === treeLibraries.library.id)?.[0]?.permissionsConf ?? null;

    const permissionsPanes = treePermsConf?.permissionTreeAttributes
        ? treePermsConf?.permissionTreeAttributes.map(a => ({
              key: 'a.id',
              menuItem: localizedLabel(a.label, lang),
              render: () => (
                  <Tab.Pane key="treePermissions" className="grow flex-col height100">
                      {
                          <DefineTreePermissionsView
                              key={a.id}
                              treeAttribute={
                                  a as GET_TREE_BY_ID_trees_list_permissions_conf_permissionsConf_permissionTreeAttributes_TreeAttribute
                              }
                              permissionType={PermissionTypes.tree_node}
                              applyTo={`${tree.id}/${treeLibraries.library.id}`}
                              readOnly={readonly}
                          />
                      }
                  </Tab.Pane>
              )
          }))
        : [];

    permissionsPanes.unshift({
        key: 'libPermissions',
        menuItem: t('permissions.library_tab_name'),
        render: () => (
            <Tab.Pane key="libPermissions" className="grow flex-col height100">
                {
                    <DefinePermByUserGroupView
                        type={PermissionTypes.tree_library}
                        key="libPermissions"
                        applyTo={`${tree.id}/${treeLibraries.library.id}`}
                        readOnly={readonly}
                    />
                }
            </Tab.Pane>
        )
    });

    return (
        <>
            <PermissionsSettingsBtn
                permissionsSettings={treePermsConf}
                onChangeSettings={_handleChangeSettings}
                library={treeLibraries.library as GET_LIB_BY_ID_libraries_list}
                readonly={readonly}
            />
            <Tab panes={permissionsPanes} className="grow flex-col height100" />
        </>
    );
}

export default NodePermissionTabContent;
