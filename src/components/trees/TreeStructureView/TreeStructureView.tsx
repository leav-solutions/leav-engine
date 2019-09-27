import React, {useState} from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import SortableTree, {ExtendedNodeData, NodeData, TreeItem} from 'react-sortable-tree';
import {Button, Loader} from 'semantic-ui-react';
import styled from 'styled-components';
import {getTreeNodeKey} from '../../../utils/utils';
import {TreeElementInput} from '../../../_gqlTypes/globalTypes';
import EditRecordModal from '../../records/EditRecordModal';
import ConfirmedButton from '../../shared/ConfirmedButton';
import Loading from '../../shared/Loading';
import './rstOverride.css';

interface IEditTreeStructureViewProps extends WithNamespaces {
    treeData: TreeItem[];
    onTreeChange: (treeData) => void;
    onVisibilityToggle: (data) => void;
    onMoveNode: (data) => void;
    onDeleteNode: (data: NodeData) => void;
    readOnly: boolean;
    onClickNode?: (nodeData: NodeData) => void;
    selection?: NodeData[] | null;
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
    const [editRecordModalOpen, setEditRecordModalOpen] = useState<boolean>(false);
    const [editedRecordId, setEditedRecordId] = useState<string>('');
    const [editedLibraryId, setEditedLIbraryId] = useState<string>('');

    // TODO: handle versions
    const [editedVersion] = useState<{[treeName: string]: TreeElementInput}>();

    const _openEditRecordModal = (record: TreeItem) => () => {
        setEditRecordModalOpen(true);
        setEditedRecordId(record.id);
        setEditedLIbraryId(record.library.id);
    };

    const _closeEditRecordModal = () => setEditRecordModalOpen(false);

    const _genNodeProps = (rowInfo: ExtendedNodeData) => {
        const onDelete = () => onDeleteNode(rowInfo);
        const onClick =
            onClickNode &&
            ((e: any) => {
                if (e.target.className !== 'rst__expandButton' && e.target.className !== 'rst__collapseButton') {
                    onClickNode({...rowInfo});
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
                    <InlineBtn key="edit_record_btn" icon="edit" onClick={_openEditRecordModal(rowInfo.node)} />
                ),
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
            <EditRecordModal
                open={editRecordModalOpen}
                onClose={_closeEditRecordModal}
                recordId={editedRecordId}
                library={editedLibraryId}
                version={editedVersion}
            />
        </div>
    );
}
export default withNamespaces()(TreeStructureView);
