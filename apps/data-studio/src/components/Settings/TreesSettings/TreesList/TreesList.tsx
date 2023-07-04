// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ClearOutlined, PlusOutlined} from '@ant-design/icons';
import {TreePicker, useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {GET_TREES_trees_list} from '_gqlTypes/GET_TREES';
import {Button, Empty, Input, Popconfirm, Space, Tooltip} from 'antd';
import {useApplicationContext} from 'context/ApplicationContext';
import {ComponentProps, SyntheticEvent, useState} from 'react';
import {DragDropContext, Draggable, DraggableProvided, DropResult, Droppable} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import TreeBlock from './TreeBlock';

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;

    > input {
        flex-grow;
    }
`;

interface ITreesListProps {
    trees: GET_TREES_trees_list[];
    onMoveTree: (treeId: string, from: number, to: number) => void;
    onRemoveTree: (treeId: string) => void;
    onAddTrees: (trees: string[]) => void;
    onClearTrees: () => void;
}

function TreesList({trees, onMoveTree, onRemoveTree, onAddTrees, onClearTrees}: ITreesListProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {currentApp} = useApplicationContext();
    const isCustomMode = Array.isArray(currentApp?.settings?.trees);
    const isReadOnly = !currentApp?.permissions?.admin_application;
    const [search, setSearch] = useState<string>('');
    const [isTreePickerOpen, setIsTreePickerOpen] = useState<boolean>(false);

    const _handleDragEnd = async (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index) {
            return;
        }

        return onMoveTree(result.draggableId, result.source.index, result.destination.index);
    };

    const _handleRemoveTree = (treeId: string) => () => {
        onRemoveTree(treeId);
    };

    const _handleClearTrees = () => {
        onClearTrees();
    };

    const _handleSearchChange = (e: SyntheticEvent<HTMLInputElement>) => {
        setSearch(e.currentTarget.value);
    };

    const _handleOpenTreePicker = () => setIsTreePickerOpen(true);
    const _handleCloseTreePicker = () => setIsTreePickerOpen(false);
    const _handleSubmitTreePicker: ComponentProps<typeof TreePicker>['onSubmit'] = async selectedTrees => {
        _handleCloseTreePicker();
        return onAddTrees(selectedTrees.map(tree => tree.id));
    };

    const displayedTrees = trees.filter(tree => {
        const label = localizedTranslation(tree.label, lang);
        const searchStr = search.toLowerCase();

        // Search on id or label
        return tree.id.toLowerCase().includes(searchStr) || label.toLowerCase().includes(searchStr);
    });

    const canDrag = !isReadOnly && !search;

    const _getTreeBlock = (tree: GET_TREES_trees_list, dragProvided?: DraggableProvided) => (
        <TreeBlock
            key={tree.id}
            canDrag={canDrag}
            customMode={isCustomMode}
            dragProvided={dragProvided}
            readOnly={isReadOnly}
            tree={tree}
            onRemoveTree={_handleRemoveTree(tree.id)}
        />
    );

    const addTreeButton = (
        <Button icon={<PlusOutlined />} type="primary" onClick={_handleOpenTreePicker}>
            {t('app_settings.trees_settings.add_tree')}
        </Button>
    );

    return (
        <>
            {!!trees.length && (
                <>
                    <Header>
                        <Input.Search
                            allowClear
                            aria-label="search"
                            onChange={_handleSearchChange}
                            style={{maxWidth: '30rem', margin: '10px'}}
                            placeholder={t('global.search') + '...'}
                        />

                        {isCustomMode && !isReadOnly ? (
                            <Space>
                                {addTreeButton}
                                <Popconfirm
                                    title={t('app_settings.trees_settings.clear_trees_confirm')}
                                    onConfirm={_handleClearTrees}
                                    placement="bottomRight"
                                    okText={t('global.submit')}
                                    cancelText={t('global.cancel')}
                                >
                                    <>
                                        <Tooltip title={t('app_settings.trees_settings.clear_trees')}>
                                            <Button icon={<ClearOutlined />} />
                                        </Tooltip>
                                    </>
                                </Popconfirm>
                            </Space>
                        ) : (
                            <></>
                        )}
                    </Header>
                    <DragDropContext onDragEnd={_handleDragEnd}>
                        <Droppable droppableId="trees_list">
                            {provided => (
                                <div ref={provided.innerRef} {...provided.droppableProps} data-testid="trees-list">
                                    {displayedTrees.map((tree, index) =>
                                        canDrag ? (
                                            <Draggable key={tree.id} index={index} draggableId={tree.id}>
                                                {dragProvided => _getTreeBlock(tree, dragProvided)}
                                            </Draggable>
                                        ) : (
                                            _getTreeBlock(tree)
                                        )
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </>
            )}
            {!trees.length && isCustomMode && (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    imageStyle={{
                        height: 60
                    }}
                    description={<span>{t('app_settings.trees_settings.no_trees')}.</span>}
                >
                    {addTreeButton}
                </Empty>
            )}
            {isCustomMode && !isReadOnly && isTreePickerOpen && (
                <TreePicker
                    open={isTreePickerOpen}
                    onClose={_handleCloseTreePicker}
                    onSubmit={_handleSubmitTreePicker}
                    selected={trees.map(lib => lib.id)}
                />
            )}
        </>
    );
}

export default TreesList;
