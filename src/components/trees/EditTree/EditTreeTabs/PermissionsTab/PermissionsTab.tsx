import {useMutation} from '@apollo/react-hooks';
import uniqBy from 'lodash/uniqBy';
import React from 'react';
import {saveTreeQuery} from '../../../../../queries/trees/saveTreeMutation';
import {GET_TREE_BY_ID_trees_list} from '../../../../../_gqlTypes/GET_TREE_BY_ID';
import {TreeNodePermissionsConfInput, Treepermissions_confInput} from '../../../../../_gqlTypes/globalTypes';
import {SAVE_TREE, SAVE_TREEVariables} from '../../../../../_gqlTypes/SAVE_TREE';
import PermissionsContent from './PermissionsContent';

interface IPermissionsTabProps {
    tree: GET_TREE_BY_ID_trees_list;
    readonly: boolean;
}

function PermissionsTab({tree, readonly}: IPermissionsTabProps): JSX.Element {
    // TODO: handle errors
    const [saveTree] = useMutation<SAVE_TREE, SAVE_TREEVariables>(saveTreeQuery);

    /**
     * Save tree's permissions conf
     * We're receiving conf for one library and we have to save the whole tree permissions conf (all libraries included)
     * Thus, we have to merge given conf with existing tree conf
     **/
    const _handleSubmitSettings = (libraryId: string, permissionsConf: Treepermissions_confInput) => {
        // Putting new conf at the beginning of this array is mandatory to be able to update existing conf
        const allPermsConf: TreeNodePermissionsConfInput[] = [
            {
                libraryId,
                permissionsConf
            },
            ...(tree.permissions_conf ?? []).map(
                (c): TreeNodePermissionsConfInput => ({
                    libraryId: c.libraryId,
                    permissionsConf: {
                        permissionTreeAttributes: c.permissionsConf.permissionTreeAttributes.map(a => a.id),
                        relation: c.permissionsConf.relation
                    }
                })
            )
        ];

        // Dedup array to keep one conf per library
        const uniqPermsConf = uniqBy(allPermsConf, el => el.libraryId);

        return saveTree({
            variables: {
                treeData: {
                    id: tree.id,
                    permissions_conf: uniqPermsConf
                }
            }
        });
    };

    return <PermissionsContent tree={tree} readonly={readonly} onSubmitSettings={_handleSubmitSettings} />;
}

export default PermissionsTab;
