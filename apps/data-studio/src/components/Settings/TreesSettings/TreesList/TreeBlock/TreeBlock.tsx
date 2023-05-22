// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, ExpandAltOutlined, HolderOutlined} from '@ant-design/icons';
import {EditTreeModal, EntityCard, FloatingMenu, FloatingMenuAction, IEntityData, PreviewSize, useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {useState} from 'react';
import {DraggableProvided} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {GET_TREES_trees_list} from '_gqlTypes/GET_TREES';

const Wrapper = styled.div`
    position: relative;
    width: 100%;
    display: grid;
    grid-template-columns: 1.5rem 1fr 1.5rem;
    justify-content: center;
    margin: 10px;
    border: 1px solid ${props => props.theme.antd?.colorBorder};
    border-radius: ${props => props.theme?.antd?.borderRadius ?? 5}px;
    background: ${props => props.theme.antd?.colorBgBase ?? '#ffffff'};

    .floating-menu {
        margin-right: 1.5rem;

        display: none;
    }

    &:hover .floating-menu {
        display: block;
    }
`;

const DragHandle = styled.div`
    cursor: grab;
    border-right: 1px solid ${props => props.theme.antd?.colorBorder};
    display: flex;
    align-items: center;
    justify-content: center;
`;

const RemoveButton = styled(CloseOutlined)`
    cursor: pointer;
`;

interface ITreeBlockProps {
    tree: GET_TREES_trees_list;
    customMode?: boolean;
    readOnly?: boolean;
    canDrag?: boolean;
    onRemoveTree: (treeId: string) => void;
    dragProvided?: DraggableProvided;
}

function TreeBlock({tree, customMode, readOnly, canDrag, onRemoveTree, dragProvided}: ITreeBlockProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const [isEditTreeModalVisible, setIsEditTreeModalVisible] = useState(false);

    const _handleOpenEditTreeModal = () => setIsEditTreeModalVisible(true);
    const _handleCloseEditTreeModal = () => setIsEditTreeModalVisible(false);
    const _handleRemoveTree = () => onRemoveTree(tree.id);

    const treeActions: FloatingMenuAction[] = [
        {
            title: t('global.details'),
            icon: <ExpandAltOutlined />,
            onClick: _handleOpenEditTreeModal
        }
    ];

    const treeIdentity: IEntityData = {
        label: localizedTranslation(tree.label, lang),
        subLabel: tree.id,
        color: null,
        preview: null
    };

    return (
        <Wrapper
            key={tree.id}
            ref={canDrag ? dragProvided?.innerRef : null}
            {...(canDrag ? dragProvided?.draggableProps : {})}
        >
            {canDrag ? (
                <DragHandle {...dragProvided?.dragHandleProps}>
                    <HolderOutlined />
                </DragHandle>
            ) : (
                <div>{/* Keep this empty div for styling purpose when not draggable */}</div>
            )}
            <EntityCard entity={treeIdentity} style={{padding: '0.7rem 0.5rem'}} size={PreviewSize.small} />
            <FloatingMenu actions={treeActions} />
            {customMode && !readOnly && <RemoveButton aria-label="remove" onClick={_handleRemoveTree} />}
            {isEditTreeModalVisible && (
                <EditTreeModal treeId={tree.id} onClose={_handleCloseEditTreeModal} open={isEditTreeModalVisible} />
            )}
        </Wrapper>
    );
}

export default TreeBlock;
