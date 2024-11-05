// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import useLang from 'hooks/useLang';
import React, {useState} from 'react';
import {useDrag, useDrop} from 'react-dnd';
import {useTranslation} from 'react-i18next';
import {Button, Header, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_TREES_trees_list, GET_TREES_trees_list_libraries} from '_gqlTypes/GET_TREES';
import {IDndDropResult, IDndLibraryItem, LIBRARY_DND_TYPE} from '../../../_types';

const LibraryItemWrapper = styled.div<{isOver: boolean}>`
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    margin: 0.25rem 0 1rem 0;
    padding: 0.5rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    cursor: grab;
    width: 100%;
    background-color: ${props => (props.isOver ? '#f5f5f5' : '#FFF')};
    position: relative;
`;

const AllowedChildrenWrapper = styled.div`
    margin-top: 1rem;
`;

const RemoveBtn = styled(Button)`
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    &&&,
    &&&:hover,
    &&&:focus {
        padding: 0;
        margin: 0;
        border: none;
        box-shadow: none;
    }
`;

const ItemHeader = styled(Header)`
    cursor: pointer;
`;

interface IDependenciesLibraryItemProps {
    tree: GET_TREES_trees_list;
    libraryItem: GET_TREES_trees_list_libraries;
    parentItemId: string;
    readOnly: boolean;
    onMove: (libraryId: string, parentFrom: string, parentTo: string) => void;
}

function DependenciesLibraryItem({
    libraryItem,
    parentItemId,
    tree,
    readOnly,
    onMove
}: IDependenciesLibraryItemProps): JSX.Element {
    const {lang} = useLang();
    const [isChildrenExpanded, setChildrenExpanded] = useState(false);
    const {t} = useTranslation();

    const _handleShowChildren = () => {
        setChildrenExpanded(!isChildrenExpanded);
    };

    const _handleRemove = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();

        onMove(libraryItem.library.id, parentItemId, null);
    };

    const [, drag] = useDrag<IDndLibraryItem, IDndDropResult, {}>({
        item: {
            type: LIBRARY_DND_TYPE,
            from: parentItemId,
            library: libraryItem
        },
        canDrag: !readOnly,
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();
            if (dropResult) {
                onMove(libraryItem.library.id, item.from, dropResult.id);
            }
        }
    });

    const [{isOverNested, isOverElement}, drop] = useDrop<
        IDndLibraryItem,
        IDndDropResult,
        {isOverNested: boolean; isOverElement: boolean}
    >({
        accept: [LIBRARY_DND_TYPE],
        canDrop: () => !readOnly,
        drop: (item, monitor) => {
            const isOverCurrent = monitor.isOver({shallow: true});

            if (!isOverCurrent) {
                return;
            }

            setChildrenExpanded(true);

            return {id: libraryItem.library.id};
        },
        collect: monitor => ({
            isOverElement: monitor.isOver({shallow: true}),
            isOverNested: monitor.isOver()
        })
    });

    const allowedLibraries = tree.libraries.filter(treeLibrary =>
        libraryItem.settings.allowedChildren.some(
            allowedChildId => allowedChildId === treeLibrary.library.id || allowedChildId === '__all__'
        )
    );

    const mustShowChildren = isChildrenExpanded || isOverNested;

    return (
        <LibraryItemWrapper
            key={libraryItem.library.id}
            ref={drag}
            isOver={isOverElement}
            data-testid={`dependencies-library-item-${libraryItem.library.id}`}
        >
            <div ref={drop}>
                <ItemHeader size="small" onClick={_handleShowChildren}>
                    <span>
                        {mustShowChildren ? (
                            <Icon name="triangle down" style={{fontSize: '1rem'}} />
                        ) : (
                            <Icon name="triangle right" style={{fontSize: '1rem'}} />
                        )}
                        {localizedTranslation(libraryItem.library.label, lang)}
                    </span>
                    {!readOnly && (
                        <RemoveBtn basic circular size="small" onClick={_handleRemove} aria-label={t('admin.remove')}>
                            <Icon name="trash" />
                        </RemoveBtn>
                    )}
                </ItemHeader>
                {mustShowChildren && (
                    <>
                        {!!allowedLibraries.length ? (
                            <AllowedChildrenWrapper data-testid="allowed-children">
                                <div>{t('trees.allow_children')}:</div>
                                {allowedLibraries.map(allowedLibrary => (
                                    <DependenciesLibraryItem
                                        key={allowedLibrary.library.id}
                                        tree={tree}
                                        libraryItem={allowedLibrary}
                                        parentItemId={libraryItem.library.id}
                                        readOnly={readOnly}
                                        onMove={onMove}
                                    />
                                ))}
                            </AllowedChildrenWrapper>
                        ) : (
                            <div>{t('trees.no_children_allowed')}</div>
                        )}
                    </>
                )}
            </div>
        </LibraryItemWrapper>
    );
}

export default DependenciesLibraryItem;
