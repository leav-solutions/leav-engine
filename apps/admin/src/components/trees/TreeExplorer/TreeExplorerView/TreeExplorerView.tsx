// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import EditRecordModal from 'components/records/EditRecordModal';
import SelectRecordModal from 'components/records/SelectRecordModal';
import Loading from 'components/shared/Loading';
import useLang from 'hooks/useLang';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    NodeData,
    OnDragPreviousAndNextLocation,
    SortableTreeWithoutDndContext as SortableTree
} from 'react-sortable-tree';
import {Button, Confirm, Dropdown, Icon, Label, Modal} from 'semantic-ui-react';
import styled from 'styled-components';
import {activeItemColor} from 'themingVar';
import {getTreeNodeKey, localizedLabel, stringToColor} from 'utils';
import {GET_TREE_BY_ID_trees_list} from '_gqlTypes/GET_TREE_BY_ID';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {fakeRootId, IExtendedTreeNodeData, ITreeNode, ITreeNodeData} from '_types/trees';
import {
    AddTreeElementHandler,
    ClickNodeHandler,
    DeleteNodeHandler,
    MoveNodeHandler,
    NodeVisibilityToggleHandler,
    TreeChangeHandler
} from '../_types';

const Wrapper = styled.div<{compact: boolean}>`
    /** Overrides some SortableTree CSS rules **/
    .rst__rowContents {
        padding: 0;
        background: transparent;
        height: 100%;
        ${props =>
            props.compact
                ? `
        min-width: 130px;
        border: none;
        box-shadow: none;
        `
                : ''}
    }

    .rst__rowLabel {
        height: 100%;
    }

    .rst__rowTitle {
        height: 100%;
    }

    .rst__row.tree-node {
        cursor: pointer;
        height: 100%;
    }

    .rst__row.tree-node.selected {
        background: ${activeItemColor};
    }
    .rst__rowWrapper {
        padding: 3px 0;
    }
    .rst__moveHandle,
    .rst__loadingHandle {
        width: 30px;
    }

    ${props =>
        props.compact
            ? `
    .rst__collapseButton,
    .rst__expandButton {
        background-size: 16px;
        width: 12px;
        height: 12px;
    }
    .rst__collapseButton:hover:not(:active),
    .rst__expandButton:hover:not(:active) {
        background-size: 20px;
        width: 16px;
        height: 16px;
    }
    `
            : ''}
`;

interface ITreeExplorerViewProps {
    treeSettings: GET_TREE_BY_ID_trees_list;
    treeData: ITreeNode[];
    onTreeChange: TreeChangeHandler;
    onVisibilityToggle: NodeVisibilityToggleHandler;
    onMoveNode: MoveNodeHandler;
    onDeleteNode: DeleteNodeHandler;
    readOnly: boolean;
    onClickNode?: ClickNodeHandler;
    selection?: ITreeNodeData[] | null;
    onAddElement?: AddTreeElementHandler;
    compact?: boolean;
}

interface IEditionState {
    recordId?: string;
    library: string;
    parent: string | null;
    path: string[];
}

const LibIconLabel = styled(Label)`
    background-color: ${props => props.bgcolor};
`;

const initialEditionState: IEditionState = {
    library: '',
    path: [],
    parent: null
};

const TreeExplorerView = ({
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
}: ITreeExplorerViewProps) => {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const [editRecordModalOpen, setEditRecordModalOpen] = useState<boolean>(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
    const [openAddElementModal, setOpenAddElementModal] = useState<boolean>(false);
    const [openSelectRecordModal, setOpenSelectRecordModal] = useState<boolean>(false);
    const [nodeToDelete, setNodeToDelete] = useState<ITreeNodeData>();

    const [editionState, setEditionState] = useState<IEditionState>(initialEditionState);

    const _handleOpenDeleteConfirm = (node: ITreeNodeData) => {
        setNodeToDelete(node);
        setOpenDeleteConfirm(true);
    };

    const _handleCloseDeleteConfirm = () => setOpenDeleteConfirm(false);

    const _handleOpenAddElementModal = (parent: string, path: string[], library: string) => () => {
        setOpenAddElementModal(true);
        setEditionState({
            parent,
            library,
            path
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

        onAddElement(record, editionState.parent, editionState.path);
        _handleCloseSelectRecordModal();
    };

    const _openEditRecordModal = (params?: {
        parent: string;
        library: string;
        recordId?: string;
        path: string[];
    }) => () => {
        setOpenAddElementModal(false);
        setEditRecordModalOpen(true);
        if (!!params) {
            setEditionState(params);
        }
    };

    const _handleEditRecordPostSave = (record: RecordIdentity_whoAmI | undefined) => {
        setEditRecordModalOpen(false);
        if (record && !editionState.recordId && editionState.parent && !!onAddElement) {
            return onAddElement(record, editionState.parent, editionState.path);
        }
    };

    const _handleDelete = () => {
        _handleCloseDeleteConfirm();
        return nodeToDelete && onDeleteNode(nodeToDelete);
    };

    const _genNodeProps = (rowInfo: IExtendedTreeNodeData) => {
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
                                            parent: rowInfo.parentNode?.id ?? fakeRootId,
                                            library: rowInfo.node.record.whoAmI.library?.id,
                                            recordId: rowInfo.node.record.whoAmI.id,
                                            path: rowInfo.path as string[]
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
                                    key={`add_record_btn_item_${lib.library.id}`}
                                    text={localizedLabel(lib.library.label, availableLanguages)}
                                    onClick={_handleOpenAddElementModal(
                                        rowInfo.node.id,
                                        rowInfo.path as string[],
                                        lib.library.id
                                    )}
                                    label={
                                        <LibIconLabel
                                            circular
                                            bgcolor={stringToColor(lib.library.id)}
                                            content={lib.library.id[0].toUpperCase()}
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

    const canDrop = (d: OnDragPreviousAndNextLocation & NodeData) => d.nextParent !== null;

    const orTxt = t('admin.or');

    const theme = {
        scaffoldBlockPxWidth: compact ? 25 : 35,
        rowHeight: compact ? 35 : 50,
        slideRegionSize: compact ? 30 : 50
    };

    return (
        <Wrapper className="grow height100" compact={compact}>
            {!treeData?.length ? (
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
        </Wrapper>
    );
};
export default TreeExplorerView;
