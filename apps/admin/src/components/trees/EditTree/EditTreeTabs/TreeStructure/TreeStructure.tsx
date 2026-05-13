import {type IKeyValue} from '@leav/utils';
import {useTranslation} from 'react-i18next';
import {type GET_TREES_trees_list} from '../../../../../_gqlTypes/GET_TREES';
import {type SAVE_TREE_saveTree_libraries_settings} from '../../../../../_gqlTypes/SAVE_TREE';
import TreeStructureView from './TreeStructureView';
import {useSaveTreeMutation} from '../../../../../_gqlTypes';

interface ITreeStructureProps {
    tree: GET_TREES_trees_list;
    readOnly: boolean;
}

function TreeStructure({tree, readOnly}: ITreeStructureProps): JSX.Element {
    const {t} = useTranslation();
    const [saveTree, {loading}] = useSaveTreeMutation({
        onError: error => undefined,
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
                            allowedChildren: dependencies[treeLibrary.library.id].allowedChildren,
                        },
                    })),
                },
            },
        });
    };

    return <TreeStructureView tree={tree} readOnly={readOnly} onChange={_handleChange} loading={loading} />;
}

export default TreeStructure;
