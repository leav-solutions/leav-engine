// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, HolderOutlined, PlusOutlined} from '@ant-design/icons';
import {LibraryPicker, useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {Button, Empty, Input} from 'antd';
import {useApplicationContext} from 'context/ApplicationContext';
import {SyntheticEvent, useState} from 'react';
import {DragDropContext, Draggable, DraggableProvidedDragHandleProps, Droppable, DropResult} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {GET_LIBRARIES_LIST_libraries_list} from '_gqlTypes/GET_LIBRARIES_LIST';

const LibraryBlock = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: 1.5rem 1fr 1.5rem;
    justify-content: center;
    margin: 10px;
    border: 1px solid ${props => props.theme.antd?.colorBorder};
    border-radius: ${props => props.theme?.antd?.borderRadius ?? 5}px;
    background: ${props => props.theme.antd?.colorBgBase ?? '#ffffff'};
`;

const DragHandle = styled.div`
    cursor: grab;
    border-right: 1px solid ${props => props.theme.antd?.colorBorder};
    display: flex;
    align-items: center;
    justify-content: center;
`;

const LibraryLabel = styled.div`
    padding: 0.5rem 0.5rem;
`;

const RemoveButton = styled(CloseOutlined)`
    cursor: pointer;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;

    > input {
        flex-grow;
    }
`;

interface ILibrariesListProps {
    libraries: GET_LIBRARIES_LIST_libraries_list[];
    onMoveLibrary: (libraryId: string, from: number, to: number) => void;
    onRemoveLibrary: (libraryId: string) => void;
    onAddLibraries: (libraries: string[]) => void;
}

function LibrariesList({libraries, onMoveLibrary, onRemoveLibrary, onAddLibraries}: ILibrariesListProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {currentApp} = useApplicationContext();
    const isCustomMode = Array.isArray(currentApp?.settings?.libraries);
    const isReadOnly = !currentApp?.permissions?.admin_application;
    const [search, setSearch] = useState<string>('');
    const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState<boolean>(false);

    const _handleDragEnd = async (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index) {
            return;
        }

        return onMoveLibrary(result.draggableId, result.source.index, result.destination.index);
    };

    const _handleRemoveLibrary = (libraryId: string) => () => {
        onRemoveLibrary(libraryId);
    };

    const _handleSearchChange = (e: SyntheticEvent<HTMLInputElement>) => {
        setSearch(e.currentTarget.value);
    };

    const _handleOpenLibraryPicker = () => setIsLibraryPickerOpen(true);
    const _handleCloseLibraryPicker = () => setIsLibraryPickerOpen(false);
    const _handleSubmitLibraryPicker = (selectedLibraries: string[]) => {
        _handleCloseLibraryPicker();
        onAddLibraries(selectedLibraries);
    };

    const displayedLibraries = libraries.filter(lib => {
        const label = localizedTranslation(lib.label, lang);
        const searchStr = search.toLowerCase();

        // Search on id or label
        return lib.id.toLowerCase().includes(searchStr) || label.toLowerCase().includes(searchStr);
    });

    const canDrag = !isReadOnly && !search;

    const _getLibraryBlock = (
        library: GET_LIBRARIES_LIST_libraries_list,
        props?: any,
        dragHandleProps?: DraggableProvidedDragHandleProps
    ) => (
        <LibraryBlock key={library.id} {...props}>
            {canDrag ? (
                <DragHandle {...dragHandleProps}>
                    <HolderOutlined />
                </DragHandle>
            ) : (
                <div>{/* Keep this empty div for styling purpose when not draggable */}</div>
            )}
            <LibraryLabel>{localizedTranslation(library.label, lang)}</LibraryLabel>
            {isCustomMode && !isReadOnly && (
                <RemoveButton aria-label="remove" onClick={_handleRemoveLibrary(library.id)} />
            )}
        </LibraryBlock>
    );

    const addLibraryButton = (
        <Button icon={<PlusOutlined />} type="primary" onClick={_handleOpenLibraryPicker}>
            {t('app_settings.add_library')}
        </Button>
    );

    return (
        <>
            {!!libraries.length && (
                <>
                    <Header>
                        <Input.Search
                            allowClear
                            aria-label="search"
                            onChange={_handleSearchChange}
                            style={{maxWidth: '30rem', margin: '10px'}}
                            placeholder={t('app_settings.search_libraries') + '...'}
                        />
                        {isCustomMode && !isReadOnly && addLibraryButton}
                    </Header>
                    <DragDropContext onDragEnd={_handleDragEnd}>
                        <Droppable droppableId="libraries_list">
                            {provided => (
                                <div ref={provided.innerRef} {...provided.droppableProps} data-testid="libraries-list">
                                    {displayedLibraries.map((lib, index) =>
                                        canDrag ? (
                                            <Draggable key={lib.id} index={index} draggableId={lib.id}>
                                                {dragProvided =>
                                                    _getLibraryBlock(
                                                        lib,
                                                        {ref: dragProvided.innerRef, ...dragProvided.draggableProps},
                                                        dragProvided.dragHandleProps
                                                    )
                                                }
                                            </Draggable>
                                        ) : (
                                            _getLibraryBlock(lib)
                                        )
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </>
            )}
            {!libraries.length && isCustomMode && (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    imageStyle={{
                        height: 60
                    }}
                    description={<span>{t('app_settings.no_libraries')}.</span>}
                >
                    {addLibraryButton}
                </Empty>
            )}
            {isCustomMode && !isReadOnly && isLibraryPickerOpen && (
                <LibraryPicker
                    open={isLibraryPickerOpen}
                    onClose={_handleCloseLibraryPicker}
                    onSubmit={_handleSubmitLibraryPicker}
                    selected={libraries.map(lib => lib.id)}
                />
            )}
        </>
    );
}

export default LibrariesList;
