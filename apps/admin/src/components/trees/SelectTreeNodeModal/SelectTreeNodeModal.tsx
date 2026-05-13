import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {type NodeData} from '@nosferatu500/react-sortable-tree';
import {Button, Modal} from 'semantic-ui-react';
import {type ITreeNodeData} from '../../../_types/trees';
import Loading from '../../shared/Loading';
import TreeExplorer from '../TreeExplorer';
import {useGetTreeByIdQuery} from '../../../_gqlTypes';
import {type GET_TREE_BY_ID_trees_list} from '../../../_gqlTypes/GET_TREE_BY_ID';

interface ISelectTreeNodeModalProps {
    tree: string;
    onSelect: (node: NodeData) => void;
    open: boolean;
    onClose: () => void;
}

const SelectTreeNodeModal = ({open, tree, onSelect, onClose}: ISelectTreeNodeModalProps): JSX.Element => {
    const {t} = useTranslation();
    const [currentSelection, setCurrentSelection] = useState<ITreeNodeData[] | null>(null);
    const {loading, error, data} = useGetTreeByIdQuery({
        variables: {
            id: [tree],
        },
    });

    const _handleNodeSelection = (node: ITreeNodeData) => setCurrentSelection([node]);
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
                <TreeExplorer
                    tree={treeSettings as GET_TREE_BY_ID_trees_list}
                    onClickNode={_handleNodeSelection}
                    readOnly
                    selection={currentSelection}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button
                    data-testid="select_tree_node_close_btn"
                    negative
                    content={t('admin.cancel')}
                    icon="cancel"
                    onClick={onClose}
                />
                {currentSelection && currentSelection.length && (
                    <Button
                        data-testid="select_tree_node_submit_btn"
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
