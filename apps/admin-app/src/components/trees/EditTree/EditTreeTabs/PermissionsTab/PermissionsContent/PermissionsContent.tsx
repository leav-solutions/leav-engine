// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Tab} from 'semantic-ui-react';
import useLang from '../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../utils';
import {GET_TREE_BY_ID_trees_list} from '../../../../../../_gqlTypes/GET_TREE_BY_ID';
import {PermissionTypes, Treepermissions_confInput} from '../../../../../../_gqlTypes/globalTypes';
import DefinePermByUserGroupView from '../../../../../permissions/DefinePermByUserGroupView';
import NodePermissionTabContent from './NodePermissionTabContent';

interface IPermissionsContentProps {
    tree: GET_TREE_BY_ID_trees_list;
    readonly: boolean;
    onSubmitSettings: (library: string, conf: Treepermissions_confInput) => void;
}

function PermissionsContent({tree, readonly, onSubmitSettings}: IPermissionsContentProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();

    let panes = [
        {
            key: 'treePermissions',
            menuItem: t('permissions.tree_tab_name'),
            render: () => (
                <Tab.Pane key="treePermissions" className="grow flex-col height100">
                    {
                        <DefinePermByUserGroupView
                            type={PermissionTypes.tree}
                            key="treePermissions"
                            applyTo={tree.id}
                            readOnly={readonly}
                        />
                    }
                </Tab.Pane>
            )
        }
    ];

    panes = [
        ...panes,
        ...tree.libraries.map(lib => ({
            key: lib.id,
            menuItem: localizedLabel(lib.label, lang),
            render: () => (
                <Tab.Pane key={lib.id} className="grow flex-col height100">
                    <NodePermissionTabContent
                        tree={tree}
                        library={lib}
                        onSubmitSettings={onSubmitSettings}
                        readonly={readonly}
                    />
                </Tab.Pane>
            )
        }))
    ];

    return <Tab panes={panes} className="grow flex-col height100" />;
}

export default PermissionsContent;
