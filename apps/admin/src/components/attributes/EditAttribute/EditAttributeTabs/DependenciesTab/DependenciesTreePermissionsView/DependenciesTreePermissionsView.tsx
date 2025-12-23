// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {fakeRootId, type ITreeNodeData} from '_types/trees';
import {getTreeNodeKey} from '../../../../../../utils/utils';
import {PermissionTypes} from '../../../../../../_gqlTypes/globalTypes';
import ColumnsDisplay from '../../../../../shared/ColumnsDisplay';
import {type ITreePermissionsDependentValuesConf} from 'components/attributes/EditAttribute/EditAttributeTabs/DependenciesTab/DependenciesSettings/DependenciesSettings';
import DefinePermissionsViewLoadTree from 'components/permissions/DefinePermissionsViewLoadTree';
import EditPermissions from 'components/permissions/EditPermissions';
import {type AttributeDetailsTreeAttributeFragment} from '_gqlTypes';
import {useTranslation} from 'react-i18next';

interface IDependenciesTreePermissionsViewProps {
    treeAttribute: AttributeDetailsTreeAttributeFragment;
    dependenciesSettings: ITreePermissionsDependentValuesConf;
}

const DependenciesTreePermissionsView = ({
    treeAttribute,
    dependenciesSettings,
}: IDependenciesTreePermissionsViewProps): JSX.Element => {
    const {t} = useTranslation();
    const usersGroupsTreeId = 'users_groups';
    const dependentAttributes = dependenciesSettings?.dependenciesTreeAttributes ?? [];

    const [selectedDepsTreeNode, setSelectedDepsTreeNode] = React.useState<ITreeNodeData[]>(
        dependentAttributes.map(() => ({
            node: {id: fakeRootId},
            path: [],
            treeIndex: 0,
        })),
    );
    const [selectedTreeNode, setSelectedTreeNode] = React.useState<ITreeNodeData | null>({
        node: {id: fakeRootId},
        path: [],
        treeIndex: 0,
    });
    const [selectedGroupNode, setSelectedGroupNode] = React.useState<ITreeNodeData | null>({
        node: {id: fakeRootId},
        path: [],
        treeIndex: 0,
    });

    React.useEffect(() => {
        // Reset selected nodes when dependencies settings change
        setSelectedDepsTreeNode(
            dependentAttributes.map(() => ({
                node: {id: fakeRootId},
                path: [],
                treeIndex: 0,
            })),
        );
    }, [dependenciesSettings]);

    const _selectDepsTreeNode = (treeIndex: number) => (nodeData: ITreeNodeData) => {
        const treeNode = getTreeNodeKey(nodeData) !== getTreeNodeKey(selectedDepsTreeNode[treeIndex]) ? nodeData : null;
        const newSelectedDepsTreeNode = [...selectedDepsTreeNode];
        newSelectedDepsTreeNode[treeIndex] = treeNode;
        setSelectedDepsTreeNode(newSelectedDepsTreeNode);
    };

    const _selectTreeNode = (nodeData: ITreeNodeData) =>
        setSelectedTreeNode(getTreeNodeKey(nodeData) !== getTreeNodeKey(selectedTreeNode) ? nodeData : null);

    const _selectGroupNode = (nodeData: ITreeNodeData) =>
        setSelectedGroupNode(getTreeNodeKey(nodeData) !== getTreeNodeKey(selectedGroupNode) ? nodeData : null);

    if (!treeAttribute.linked_tree) {
        return <p>Cannot find tree</p>;
    }

    const cols = dependentAttributes
        .map((depAttribute, index) => {
            if (!depAttribute.linked_tree) {
                return <p key={depAttribute.id}>Cannot find dependent tree of {depAttribute.id}</p>;
            }
            return (
                <DefinePermissionsViewLoadTree
                    key={`dep_tree_${depAttribute.id}`}
                    headerPrefix={t('attributes.dependencies.dependency_header_prefix')}
                    treeId={depAttribute.linked_tree.id}
                    onClick={_selectDepsTreeNode(index)}
                    selectedNode={selectedDepsTreeNode[index]}
                />
            );
        })
        .concat([
            <DefinePermissionsViewLoadTree
                key="perm_tree"
                headerPrefix={t('attributes.dependencies.target_header_prefix')}
                treeId={treeAttribute.linked_tree.id}
                onClick={_selectTreeNode}
                selectedNode={selectedTreeNode}
            />,
        ]);

    if (selectedTreeNode) {
        cols.push(
            <DefinePermissionsViewLoadTree
                treeId={usersGroupsTreeId}
                onClick={_selectGroupNode}
                selectedNode={selectedGroupNode}
            />,
        );

        if (selectedGroupNode) {
            cols.push(
                <EditPermissions
                    permParams={{
                        type: PermissionTypes.attribute_dependent_values,
                        applyTo: treeAttribute.id,
                        usersGroup: selectedGroupNode.node.id !== fakeRootId ? selectedGroupNode.node.id : null,
                        permissionTreeTarget: {
                            tree: treeAttribute.linked_tree.id,
                            nodeId: selectedTreeNode.node.id !== fakeRootId ? selectedTreeNode.node.id : null,
                        },
                        dependenciesTreeTargets: dependentAttributes.map((depAttribute, index) => ({
                            tree: depAttribute.linked_tree!.id,
                            nodeId:
                                selectedDepsTreeNode[index]?.node.id !== fakeRootId
                                    ? selectedDepsTreeNode[index]?.node.id
                                    : null,
                            attributeId: depAttribute.id,
                        })),
                    }}
                />,
            );
        }
    }

    return <ColumnsDisplay columnsNumber={dependentAttributes.length + 2} columnsContent={cols} />;
};

export default DependenciesTreePermissionsView;
