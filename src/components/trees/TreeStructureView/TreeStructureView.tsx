import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import SortableTree, {ExtendedNodeData, NodeData, TreeItem} from 'react-sortable-tree';
import {Button, Loader} from 'semantic-ui-react';
import ConfirmedButton from 'src/components/shared/ConfirmedButton';
import Loading from 'src/components/shared/Loading';
import {getTreeNodeKey} from 'src/utils/utils';
import styled from 'styled-components';
import './rstOverride.css';

interface IEditTreeStructureViewProps extends WithNamespaces {
    treeData: TreeItem[];
    onTreeChange: (treeData) => void;
    onVisibilityToggle: (data) => void;
    onMoveNode: (data) => void;
    onDeleteNode: (data: NodeData) => void;
    readOnly: boolean;
    onClickNode?: (nodeData: NodeData) => void;
    selection?: [NodeData] | null;
}

/* tslint:disable-next-line:variable-name */
const InlineBtn = styled(Button)`
    /* Trick to override more specific CSS rules */
    &&& {
        background: none;
        padding: 0;
    }
`;

function TreeStructureView({
    treeData,
    onTreeChange,
    onVisibilityToggle,
    onMoveNode,
    onDeleteNode,
    onClickNode,
    selection,
    readOnly,
    t
}: IEditTreeStructureViewProps) {
    const _genNodeProps = (rowInfo: ExtendedNodeData) => {
        const onDelete = () => onDeleteNode(rowInfo);
        const onClick =
            onClickNode &&
            ((e: any) => {
                if (e.target.className !== 'rst__expandButton' && e.target.className !== 'rst__collapseButton') {
                    onClickNode(rowInfo);
                }
            });

        const nodeClasses = ['tree-node'];

        if (selection && selection.find(n => getTreeNodeKey(n) === getTreeNodeKey(rowInfo))) {
            nodeClasses.push('selected');
        }

        return {
            buttons: [
                rowInfo.node.loading && <Loader key="loader_spinner" size="mini" active inline />,
                !readOnly && (
                    <ConfirmedButton
                        key="delete_btn"
                        action={onDelete}
                        confirmMessage={t('trees.confirm_delete_element')}
                    >
                        <InlineBtn icon="delete" />
                    </ConfirmedButton>
                )
            ],
            className: nodeClasses.join(' '),
            onClick
        };
    };

    return (
        <div className="grow height100">
            {!treeData.length ? (
                <Loading withDimmer />
            ) : (
                <SortableTree
                    canDrag={!readOnly}
                    treeData={treeData}
                    onChange={onTreeChange}
                    onVisibilityToggle={onVisibilityToggle}
                    getNodeKey={getTreeNodeKey}
                    generateNodeProps={_genNodeProps}
                    onMoveNode={onMoveNode}
                />
            )}
        </div>
    );
}
export default withNamespaces()(TreeStructureView);
