// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import uniqBy from 'lodash/uniqBy';
import {type GET_TREE_BY_ID_trees_list} from '../../../../../_gqlTypes/GET_TREE_BY_ID';
import {type TreeNodePermissionsConfInput, type TreepermissionsConfInput, useSaveTreeMutation} from '_gqlTypes';
import PermissionsContent from './PermissionsContent';

interface IPermissionsTabProps {
    tree: GET_TREE_BY_ID_trees_list;
    readonly: boolean;
}

function PermissionsTab({tree, readonly}: IPermissionsTabProps): JSX.Element {
    // TODO: handle errors
    const [saveTree] = useSaveTreeMutation();

    /**
     * Save tree's permissions conf
     * We're receiving conf for one library and we have to save the whole tree permissions conf (all libraries included)
     * Thus, we have to merge given conf with existing tree conf
     **/
    const _handleSubmitSettings = (libraryId: string, permissionsConf: TreepermissionsConfInput) => {
        // Putting new conf at the beginning of this array is mandatory to be able to update existing conf
        const allPermsConf: TreeNodePermissionsConfInput[] = [
            {
                libraryId,
                permissionsConf,
            },
            ...(tree.permissions_conf ?? []).map(
                (c): TreeNodePermissionsConfInput => ({
                    libraryId: c.libraryId,
                    permissionsConf: {
                        permissionTreeAttributes: c.permissionsConf.permissionTreeAttributes.map(a => a.id),
                        relation: c.permissionsConf.relation,
                    },
                }),
            ),
        ];

        // Dedup array to keep one conf per library
        const uniqPermsConf = uniqBy(allPermsConf, el => el.libraryId);

        return saveTree({
            variables: {
                treeData: {
                    id: tree.id,
                    permissions_conf: uniqPermsConf,
                },
            },
        });
    };

    return <PermissionsContent tree={tree} readonly={readonly} onSubmitSettings={_handleSubmitSettings} />;
}

export default PermissionsTab;
