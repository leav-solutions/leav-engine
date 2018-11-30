import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import SortableTree, {NodeData, TreeIndex, TreeItem, TreeNode} from 'react-sortable-tree';
import {Button, Loader} from 'semantic-ui-react';
import ConfirmedButton from 'src/components/shared/ConfirmedButton';
import Loading from 'src/components/shared/Loading';
import './rstOverride.css';

interface IEditTreeStructureViewProps extends WithNamespaces {
    treeData: TreeItem[];
    onTreeChange: (treeData) => void;
    onVisibilityToggle: (data) => void;
    onMoveNode: (data) => void;
    onDeleteNode: (data: NodeData) => void;
    getNodeKey?(data: TreeNode & TreeIndex): string | number;
}

function TreeStructureView({
    treeData,
    onTreeChange,
    onVisibilityToggle,
    getNodeKey,
    onMoveNode,
    onDeleteNode,
    t
}: IEditTreeStructureViewProps) {
    const _genNodeProps = rowInfo => {
        const onDelete = () => onDeleteNode(rowInfo);

        return {
            buttons: [
                rowInfo.node.loading && <Loader key="loader_spinner" size="mini" active inline />,
                <ConfirmedButton key="delete_btn" action={onDelete} confirmMessage={t('trees.confirm_delete_element')}>
                    <Button icon="delete" style={{background: 'none', padding: 0}} />
                </ConfirmedButton>
            ]
        };
    };

    return (
        <div style={{height: 400}}>
            {!treeData.length ? (
                <Loading withDimmer />
            ) : (
                <SortableTree
                    treeData={treeData}
                    onChange={onTreeChange}
                    onVisibilityToggle={onVisibilityToggle}
                    getNodeKey={getNodeKey}
                    generateNodeProps={_genNodeProps}
                    onMoveNode={onMoveNode}
                />
            )}
        </div>
    );
}
export default withNamespaces()(TreeStructureView);
