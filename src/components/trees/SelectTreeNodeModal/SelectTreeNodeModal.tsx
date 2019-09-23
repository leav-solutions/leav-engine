import React, {useState} from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {NodeData, TreeItem} from 'react-sortable-tree';
import {Button, Modal} from 'semantic-ui-react';
import TreeStructure from '../TreeStructure';

interface ISelectTreeNodeModalProps extends WithNamespaces {
    tree: string;
    onSelect: (node: TreeItem) => void;
    open: boolean;
    onClose: () => void;
}

function SelectTreeNodeModal({open, tree, onSelect, onClose, t}: ISelectTreeNodeModalProps): JSX.Element {
    const [currentSelection, setCurrentSelection] = useState<NodeData[] | null>(null);

    const _handleNodeSelection = (node: NodeData) => setCurrentSelection([node]);
    const _handleSubmit = () => {
        const selectedNode = currentSelection![0];

        return onSelect(selectedNode);
    };

    return (
        <Modal open={open} onClose={onClose} closeIcon>
            <Modal.Header>{t('trees.select_tree_node')}</Modal.Header>
            <Modal.Content style={{height: '80vh'}}>
                <TreeStructure treeId={tree} onClickNode={_handleNodeSelection} readOnly selection={currentSelection} />
            </Modal.Content>
            <Modal.Actions>
                <Button
                    data-test-id="select_tree_node_close_btn"
                    negative
                    content={t('admin.cancel')}
                    icon="cancel"
                    onClick={onClose}
                />
                {currentSelection && currentSelection.length && (
                    <Button
                        data-test-id="select_tree_node_submit_btn"
                        positive
                        content={t('admin.submit')}
                        icon="check"
                        onClick={_handleSubmit}
                    />
                )}
            </Modal.Actions>
        </Modal>
    );
}

export default withNamespaces()(SelectTreeNodeModal);
