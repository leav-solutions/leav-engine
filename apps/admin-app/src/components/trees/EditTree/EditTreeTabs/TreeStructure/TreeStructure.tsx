// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {IKeyValue} from '@leav/utils';
import {saveTreeQuery} from 'queries/trees/saveTreeMutation';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {GET_TREES_trees_list} from '_gqlTypes/GET_TREES';
import {SAVE_TREE, SAVE_TREEVariables, SAVE_TREE_saveTree_libraries_settings} from '_gqlTypes/SAVE_TREE';
import TreeStructureView from './TreeStructureView';

interface ITreeStructureProps {
    tree: GET_TREES_trees_list;
    readOnly: boolean;
}

function TreeStructure({tree, readOnly}: ITreeStructureProps): JSX.Element {
    const {t} = useTranslation();
    const [saveTree, {loading}] = useMutation<SAVE_TREE, SAVE_TREEVariables>(saveTreeQuery, {
        onError: error => undefined
    });

    const _handleChange = async (dependencies: IKeyValue<SAVE_TREE_saveTree_libraries_settings>) => {
        await saveTree({
            variables: {
                treeData: {
                    id: tree.id,
                    libraries: tree.libraries?.map(treeLibrary => ({
                        library: treeLibrary.library.id,
                        settings: {
                            allowMultiplePositions: dependencies[treeLibrary.library.id].allowMultiplePositions,
                            allowedAtRoot: dependencies[treeLibrary.library.id].allowedAtRoot,
                            allowedChildren: dependencies[treeLibrary.library.id].allowedChildren
                        }
                    }))
                }
            }
        });
    };

    return <TreeStructureView tree={tree} readOnly={readOnly} onChange={_handleChange} loading={loading} />;
}

export default TreeStructure;
