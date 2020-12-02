// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/react-hooks';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {NodeData} from 'react-sortable-tree';
import {Button, Modal} from 'semantic-ui-react';
import {getTreesQuery} from '../../../queries/trees/getTreesQuery';
import {GET_TREES, GET_TREESVariables} from '../../../_gqlTypes/GET_TREES';
import Loading from '../../shared/Loading';
import TreeStructure from '../TreeStructure';

interface ISelectTreeNodeModalProps {
    tree: string;
    onSelect: (node: NodeData) => void;
    open: boolean;
    onClose: () => void;
}

const SelectTreeNodeModal = ({open, tree, onSelect, onClose}: ISelectTreeNodeModalProps): JSX.Element => {
    const {t} = useTranslation();
    const [currentSelection, setCurrentSelection] = useState<NodeData[] | null>(null);
    const {loading, error, data} = useQuery<GET_TREES, GET_TREESVariables>(getTreesQuery, {
        variables: {
            id: tree
        }
    });

    const _handleNodeSelection = (node: NodeData) => setCurrentSelection([node]);
    const _handleSubmit = () => {
        const selectedNode = currentSelection![0];

        return onSelect(selectedNode);
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <p>ERROR {error}</p>;
    }

    if (!data || !data.trees || !data.trees.list.length) {
        return <p>Unknown tree</p>;
    }

    const treeSettings = data.trees.list[0];

    return (
        <Modal open={open} onClose={onClose} closeIcon>
            <Modal.Header>{t('trees.select_tree_node')}</Modal.Header>
            <Modal.Content style={{height: '80vh'}}>
                <TreeStructure
                    tree={treeSettings}
                    onClickNode={_handleNodeSelection}
                    readOnly
                    selection={currentSelection}
                />
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
};

export default SelectTreeNodeModal;
