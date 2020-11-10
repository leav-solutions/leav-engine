// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useReducer, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ExtendedNodeData, NodeData, SortableTreeWithoutDndContext as SortableTree, TreeItem} from 'react-sortable-tree';
import {Button, Confirm, Dropdown, Icon, Label, Loader, Modal} from 'semantic-ui-react';
import styled from 'styled-components';
import useLang from '../../../../../../hooks/useLang';
import {getTreeNodeKey, localizedLabel, stringToColor} from '../../../../../../utils/utils';
import {GET_TREES_trees_list} from '../../../../../../_gqlTypes/GET_TREES';
import {TreeElementInput} from '../../../../../../_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '../../../../../../_gqlTypes/RecordIdentity';
import EditRecordModal from '../../../../../records/EditRecordModal';
import SelectRecordModal from '../../../../../records/SelectRecordModal';
import Loading from '../../../../../shared/Loading';
import './rstOverride.css';

interface IStructureViewProps {
    treeSettings: GET_TREES_trees_list;
    treeData: TreeItem[];
    onTreeChange: (treeData) => void;
    onVisibilityToggle: (data) => void;
    onMoveNode: (data) => void;
    onDeleteNode: (data: NodeData) => void;
    readOnly: boolean;
    onClickNode?: (nodeData: NodeData) => void;
    selection?: NodeData[] | null;
    onAddElement?: (record: RecordIdentity_whoAmI, parent: TreeItem) => void;
    compact?: boolean;
}

interface IEditionState {
    recordId?: string;
    library: string;
    parent: TreeItem | null;
}

const LibIconLabel = styled(Label)`
    background-color: ${props => props.bgcolor};
`;

const initialEditionState: IEditionState = {
    library: '',
    parent: null
};

const editionReducer = (prevState: IEditionState | undefined, newState: IEditionState): IEditionState => {
    return {...newState};
};

const StructureView = ({
    treeSettings,
    treeData,
    onTreeChange,
    onVisibilityToggle,
    onMoveNode,
    onDeleteNode,
    onClickNode,
    selection,
    readOnly,
    onAddElement,
    compact = false
}: IStructureViewProps) => {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const [editRecordModalOpen, setEditRecordModalOpen] = useState<boolean>(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
    const [openAddElementModal, setOpenAddElementModal] = useState<boolean>(false);
    const [openSelectRecordModal, setOpenSelectRecordModal] = useState<boolean>(false);
    const [nodeToDelete, setNodeToDelete] = useState<NodeData>();

    const [editionState, editionDispatch] = useReducer(editionReducer, initialEditionState);

    const _handleOpenDeleteConfirm = (node: NodeData) => {
        setNodeToDelete(node);
        setOpenDeleteConfirm(true);
    };

    const _handleCloseDeleteConfirm = () => setOpenDeleteConfirm(false);

    const _handleOpenAddElementModal = (parent: TreeItem, library: string, recordId?: string) => () => {
        setOpenAddElementModal(true);
        editionDispatch({
            parent,
            library
        });
    };
    const _handleCloseAddElementModal = () => setOpenAddElementModal(false);

    const _handleOpenSelectRecordModal = () => {
        _handleCloseAddElementModal();
        setOpenSelectRecordModal(true);
    };
    const _handleCloseSelectRecordModal = () => setOpenSelectRecordModal(false);
    const _handleSelectElement = (record: RecordIdentity_whoAmI) => {
        if (!editionState.parent || !onAddElement) {
            return;
        }

        onAddElement(record, editionState.parent!);
        _handleCloseSelectRecordModal();
    };

    // TODO: handle versions
    const [editedVersion] = useState<{[treeName: string]: TreeElementInput}>();

    const _openEditRecordModal = (params?: {parent: TreeItem; library: string; recordId?: string}) => () => {
        setOpenAddElementModal(false);
        setEditRecordModalOpen(true);
        if (!!params) {
            editionDispatch(params);
        }
    };

    const _handleEditRecordPostSave = (record: RecordIdentity_whoAmI | undefined) => {
        setEditRecordModalOpen(false);
        if (record && !editionState.recordId && editionState.parent && !!onAddElement) {
            return onAddElement(record, editionState.parent);
        }
    };

    const _handleDelete = () => {
        _handleCloseDeleteConfirm();
        return nodeToDelete && onDeleteNode(nodeToDelete);
    };

    const _genNodeProps = (rowInfo: ExtendedNodeData) => {
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

        const _handleClickDelete = () => _handleOpenDeleteConfirm(rowInfo);
        const isFakeRoot = rowInfo.node.isFakeRoot;
        return {
            canDrag: !readOnly && !isFakeRoot,
            buttons: [
                rowInfo.node.loading && <Loader key="loader_spinner" size="mini" active inline />,
                !readOnly && (
                    <Dropdown pointing={false} basic compact icon="ellipsis vertical">
                        <Dropdown.Menu>
                            {!isFakeRoot && (
                                <>
                                    <Dropdown.Item
                                        key="edit_record_btn_item"
                                        text={t('records.edit')}
                                        icon="edit outline"
                                        onClick={_openEditRecordModal({
                                            parent: rowInfo.parentNode,
                                            library: rowInfo.node.library.id,
                                            recordId: rowInfo.node.id
                                        })}
                                    />
                                    <Dropdown.Item
                                        key="delete_record_btn_item"
                                        text={t('trees.delete')}
                                        icon="alternate trash outline"
                                        onClick={_handleClickDelete}
                                    />
                                    <Dropdown.Divider />
                                </>
                            )}
                            <Dropdown.Header icon="plus square outline" content={t('trees.add_element')} />
                            {treeSettings.libraries.map(lib => (
                                <Dropdown.Item
                                    key={`add_record_btn_item_${lib.id}`}
                                    text={localizedLabel(lib.label, availableLanguages)}
                                    onClick={_handleOpenAddElementModal(rowInfo.node, lib.id)}
                                    label={
                                        <LibIconLabel
                                            circular
                                            bgcolor={stringToColor(lib.id)}
                                            content={lib.id[0].toUpperCase()}
                                        />
                                    }
                                />
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                )
            ],
            className: nodeClasses.join(' '),
            onClick
        };
    };

    const canDrop = d => d.nextParent !== null;
    const orTxt = t('admin.or');

    const theme = compact
        ? {
              scaffoldBlockPxWidth: 50,
              rowHeight: 40,
              slideRegionSize: 50
          }
        : undefined;

    return (
        <div className="grow height100">
            {!treeData.length ? (
                <Loading withDimmer />
            ) : (
                <SortableTree
                    data-test-id="sortable-tree"
                    canDrag={!readOnly}
                    canDrop={canDrop}
                    treeData={treeData}
                    onChange={onTreeChange}
                    onVisibilityToggle={onVisibilityToggle}
                    getNodeKey={getTreeNodeKey}
                    generateNodeProps={_genNodeProps}
                    onMoveNode={onMoveNode}
                    theme={theme}
                />
            )}
            <EditRecordModal
                open={editRecordModalOpen}
                onClose={_handleEditRecordPostSave}
                recordId={editionState.recordId}
                library={editionState.library}
                version={editedVersion}
            />
            {!readOnly && (
                <>
                    <Confirm
                        data-test-id="delete_confirm_modal"
                        open={openDeleteConfirm}
                        onCancel={_handleCloseDeleteConfirm}
                        onConfirm={_handleDelete}
                        content={t('records.delete_confirm')}
                    />
                    <Modal open={openAddElementModal} onClose={_handleCloseAddElementModal} closeIcon>
                        <Modal.Header>
                            <Icon name="plus square outline" />
                            {t('trees.add_element')}
                        </Modal.Header>
                        <Modal.Content style={{textAlign: 'center'}}>
                            <Button.Group size="large">
                                <Button type="button" onClick={_openEditRecordModal()}>
                                    <Icon name="plus circle" />
                                    {t('records.create_record')}
                                </Button>
                                <Button.Or text={orTxt} />
                                <Button type="button" onClick={_handleOpenSelectRecordModal}>
                                    <Icon name="search" />
                                    {t('records.select_record')}
                                </Button>
                            </Button.Group>
                        </Modal.Content>
                    </Modal>
                    <SelectRecordModal
                        open={openSelectRecordModal}
                        library={editionState.library}
                        onClose={_handleCloseSelectRecordModal}
                        onSelect={_handleSelectElement}
                    />
                </>
            )}
        </div>
    );
};
export default StructureView;
