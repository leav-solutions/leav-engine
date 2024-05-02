// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ClearOutlined, PlusOutlined} from '@ant-design/icons';
import {EditLibraryModal, LibraryPicker, useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {GET_LIBRARIES_LIST_libraries_list} from '_gqlTypes/GET_LIBRARIES_LIST';
import {Button, Empty, Input, Popconfirm, Space, Tooltip} from 'antd';
import {useApplicationContext} from 'context/ApplicationContext';
import {SyntheticEvent, useState} from 'react';
import {DragDropContext, Draggable, DraggableProvided, DropResult, Droppable} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {LibraryLightFragment} from '../../../../../../../libs/ui/src/_gqlTypes';
import LibraryBlock from './LibraryBlock';
import {useApplicationLibraries} from 'hooks/useApplicationLibraries';

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
    onClearLibraries: () => void;
}

function LibrariesList({
    libraries,
    onMoveLibrary,
    onRemoveLibrary,
    onAddLibraries,
    onClearLibraries
}: ILibrariesListProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {currentApp} = useApplicationContext();
    const {updateQuery} = useApplicationLibraries();
    const isCustomMode = Array.isArray(currentApp?.settings?.libraries);
    const isReadOnly = !currentApp?.permissions?.admin_application;
    const [search, setSearch] = useState<string>('');
    const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState<boolean>(false);
    const [isNewLibraryModalOpen, setIsNewLibraryModalOpen] = useState(false);

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
    const _handleSubmitLibraryPicker = (selectedLibraries: LibraryLightFragment[]) => {
        _handleCloseLibraryPicker();
        onAddLibraries(selectedLibraries.map(lib => lib.id));
    };
    const _handleClearLibraries = () => {
        onClearLibraries();
    };

    const _handleClickNewLibrary = () => setIsNewLibraryModalOpen(true);
    const _handleCloseNewLibrary = () => setIsNewLibraryModalOpen(false);

    const displayedLibraries = libraries.filter(lib => {
        const label = localizedTranslation(lib.label, lang);
        const searchStr = search.toLowerCase();

        // Search on id or label
        return lib.id.toLowerCase().includes(searchStr) || label.toLowerCase().includes(searchStr);
    });

    const canDrag = !isReadOnly && !search;

    const _getLibraryBlock = (library: GET_LIBRARIES_LIST_libraries_list, dragProvided?: DraggableProvided) => (
        <LibraryBlock
            key={library.id}
            canDrag={canDrag}
            customMode={isCustomMode}
            dragProvided={dragProvided}
            readOnly={isReadOnly}
            library={library}
            onRemoveLibrary={_handleRemoveLibrary(library.id)}
        />
    );

    const addLibraryButton = (
        <Button icon={<PlusOutlined />} type="primary" onClick={_handleOpenLibraryPicker}>
            {t('app_settings.libraries_settings.add_library')}
        </Button>
    );

    const createLibraryButton = (
        <Button type="primary" icon={<PlusOutlined />} onClick={_handleClickNewLibrary}>
            {t('app_settings.libraries_settings.new_library')}
        </Button>
    );

    const _handlePostCreate = async (newLibrary: any) => {
        updateQuery(data => ({
                libraries: {__typename: 'LibrariesList', list: [...(data?.libraries?.list || []), newLibrary]}
            }));
    };

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
                            placeholder={t('global.search') + '...'}
                        />
                        {!isCustomMode && !isReadOnly && createLibraryButton}
                        {isCustomMode && !isReadOnly && (
                            <Space>
                                {addLibraryButton}
                                <Popconfirm
                                    title={t('app_settings.libraries_settings.clear_libraries_confirm')}
                                    onConfirm={_handleClearLibraries}
                                    placement="bottomRight"
                                    okText={t('global.submit')}
                                    cancelText={t('global.cancel')}
                                >
                                    {/* Do not remove the div. Workaround for issue https://github.com/ant-design/ant-design/issues/41206 */}
                                    <>
                                        <Tooltip title={t('app_settings.libraries_settings.clear_libraries')}>
                                            <Button icon={<ClearOutlined />} />
                                        </Tooltip>
                                    </>
                                </Popconfirm>
                            </Space>
                        )}
                    </Header>
                    <DragDropContext onDragEnd={_handleDragEnd}>
                        <Droppable droppableId="libraries_list">
                            {provided => (
                                <div ref={provided.innerRef} {...provided.droppableProps} data-testid="libraries-list">
                                    {displayedLibraries.map((lib, index) =>
                                        canDrag ? (
                                            <Draggable key={lib.id} index={index} draggableId={lib.id}>
                                                {dragProvided => _getLibraryBlock(lib, dragProvided)}
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
                    description={<span>{t('app_settings.libraries_settings.no_libraries')}.</span>}
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
            {isNewLibraryModalOpen && (
                <EditLibraryModal
                    open={isNewLibraryModalOpen}
                    onClose={_handleCloseNewLibrary}
                    onPostCreate={_handlePostCreate}
                    width={790}
                />
            )}
        </>
    );
}

export default LibrariesList;
