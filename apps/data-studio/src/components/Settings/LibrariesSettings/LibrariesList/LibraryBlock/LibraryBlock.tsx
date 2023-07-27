// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, ExpandAltOutlined, HolderOutlined} from '@ant-design/icons';
import {
    EditLibraryModal,
    EntityCard,
    FloatingMenu,
    FloatingMenuAction,
    IEntityData,
    PreviewSize,
    useLang
} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {useState, useEffect} from 'react';
import {DraggableProvided} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {GET_LIBRARIES_LIST_libraries_list} from '_gqlTypes/GET_LIBRARIES_LIST';
import {useAppSelector} from 'reduxStore/store';
import {TaskStatus} from '_gqlTypes/globalTypes';
import {GET_TASKS_tasks_list} from '_gqlTypes/GET_TASKS';

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

interface ILibraryBlockProps {
    library: GET_LIBRARIES_LIST_libraries_list;
    customMode?: boolean;
    readOnly?: boolean;
    canDrag?: boolean;
    onRemoveLibrary: (libraryId: string) => void;
    dragProvided?: DraggableProvided;
}

function LibraryBlock({
    library,
    customMode,
    readOnly,
    canDrag,
    onRemoveLibrary,
    dragProvided
}: ILibraryBlockProps): JSX.Element {
    const {t: translation} = useTranslation();
    const {lang} = useLang();
    const {tasks} = useAppSelector(state => state.tasks);
    const [isEditLibraryModalVisible, setIsEditLibraryModalVisible] = useState(false);
    const [indexationTask, setIndexationTask] = useState<string>();

    const _handleOpenEditLibraryModal = () => setIsEditLibraryModalVisible(true);
    const _handleCloseEditLibraryModal = () => setIsEditLibraryModalVisible(false);
    const _handleRemoveLibrary = () => onRemoveLibrary(library.id);

    const libraryActions: FloatingMenuAction[] = [
        {
            title: translation('global.details'),
            icon: <ExpandAltOutlined />,
            onClick: _handleOpenEditLibraryModal
        }
    ];

    const libraryIdentity: IEntityData = {
        label: localizedTranslation(library.label, lang),
        subLabel: library.id,
        color: null,
        preview: library.icon?.whoAmI?.preview?.[PreviewSize.small] as string
    };

    const isTaskInProgress = (task: GET_TASKS_tasks_list): boolean =>
        task.status === TaskStatus.CREATED ||
        task.status === TaskStatus.PENDING ||
        task.status === TaskStatus.PENDING_CANCEL ||
        task.status === TaskStatus.RUNNING;

    useEffect(() => {
        const task = Object.values(tasks).filter(
            t => t.role.type === 'INDEXATION' && t.role.detail === library.id && isTaskInProgress(t)
        )[0];

        setIndexationTask(task?.id);
    }, [tasks, useAppSelector]);

    return (
        <Wrapper
            key={library.id}
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
            <EntityCard entity={libraryIdentity} style={{padding: '0.7rem 0.5rem'}} size={PreviewSize.small} />
            {/* <LibraryLabel>{localizedTranslation(library.label, lang)}</LibraryLabel> */}
            <FloatingMenu actions={libraryActions} />
            {customMode && !readOnly && <RemoveButton aria-label="remove" onClick={_handleRemoveLibrary} />}
            {isEditLibraryModalVisible && (
                <EditLibraryModal
                    libraryId={library.id}
                    onClose={_handleCloseEditLibraryModal}
                    open={isEditLibraryModalVisible}
                    indexationTask={indexationTask}
                />
            )}
        </Wrapper>
    );
}

export default LibraryBlock;
