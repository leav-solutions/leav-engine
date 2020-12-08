import React from 'react';
import {useTranslation} from 'react-i18next';
import {Tab} from 'semantic-ui-react';
import useLang from '../../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../../utils';
import {
    GET_TREE_BY_ID_trees_list,
    GET_TREE_BY_ID_trees_list_libraries,
    GET_TREE_BY_ID_trees_list_permissions_conf_permissionsConf_permissionTreeAttributes_TreeAttribute
} from '../../../../../../../_gqlTypes/GET_TREE_BY_ID';
import {
    AttributeType,
    PermissionsRelation,
    PermissionTypes,
    Treepermissions_confInput
} from '../../../../../../../_gqlTypes/globalTypes';
import DefinePermByUserGroupView from '../../../../../../permissions/DefinePermByUserGroupView';
import DefineTreePermissionsView from '../../../../../../permissions/DefineTreePermissionsView';
import PermissionsAttributesSelector from '../../../../../../permissions/PermissionsAttributesSelector';

interface INodePermissionTabContentProps {
    tree: GET_TREE_BY_ID_trees_list;
    library: GET_TREE_BY_ID_trees_list_libraries;
    onSubmitSettings: (library: string, conf: Treepermissions_confInput) => void;
    readonly: boolean;
}

function NodePermissionTabContent({
    readonly,
    library,
    tree,
    onSubmitSettings
}: INodePermissionTabContentProps): JSX.Element {
    const {lang} = useLang();
    const {t} = useTranslation();
    const _handleSubmit = (conf: Treepermissions_confInput) => onSubmitSettings(library.id, conf);

    const attributes = library.attributes ? library.attributes.filter(a => a.type === AttributeType.tree) : [];
    const treePermsConf = tree.permissions_conf?.filter(p => p.libraryId === library.id)?.[0]?.permissionsConf ?? null;

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
                              applyTo={`${tree.id}/${library.id}`}
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
                        applyTo={`${tree.id}/${library.id}`}
                        readOnly={readonly}
                    />
                }
            </Tab.Pane>
        )
    });

    return (
        <>
            <PermissionsAttributesSelector
                attributes={attributes}
                readonly={readonly}
                permissionsConf={{
                    relation: treePermsConf?.relation ?? PermissionsRelation.and,
                    permissionTreeAttributes: treePermsConf?.permissionTreeAttributes.map(a => a.id) ?? []
                }}
                onSubmitSettings={_handleSubmit}
            />
            <Tab panes={permissionsPanes} className="grow flex-col height100" />
        </>
    );
}

export default NodePermissionTabContent;
