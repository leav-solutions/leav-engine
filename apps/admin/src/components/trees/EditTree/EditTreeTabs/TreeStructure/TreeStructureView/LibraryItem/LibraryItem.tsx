// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import useLang from 'hooks/useLang';
import React from 'react';
import {useDrag} from 'react-dnd';
import {useTranslation} from 'react-i18next';
import {Button, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_TREES_trees_list_libraries} from '_gqlTypes/GET_TREES';
import {IDndDropResult, IDndLibraryItem, ROOT_ID} from '../../_types';

interface ILibraryItemProps {
    treeLibrary: GET_TREES_trees_list_libraries;
    readOnly: boolean;
    onMove: (libraryId: string, parentFrom: string, parentTo: string) => void;
}

const LibraryItemWrapper = styled.div`
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    margin: 1rem 0;
    padding: 0.5rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    cursor: grab;
    width: 100%;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const AddBtn = styled(Button)`
    &&&,
    &&&:hover,
    &&&:focus {
        border: none;
        box-shadow: none;
    }
`;

function LibraryItem({treeLibrary, readOnly, onMove}: ILibraryItemProps): JSX.Element {
    const {lang} = useLang();
    const {t} = useTranslation();

    const [, drag] = useDrag<IDndLibraryItem, IDndDropResult, {}>({
        item: {
            type: 'library',
            from: null,
            library: treeLibrary
        },
        canDrag: !readOnly,
        end: (_, monitor) => {
            const dropResult = monitor.getDropResult();
            if (dropResult) {
                onMove(treeLibrary.library.id, null, dropResult.id);
            }
        }
    });

    const _handleAdd = () => {
        onMove(treeLibrary.library.id, null, ROOT_ID);
    };

    return (
        <LibraryItemWrapper
            key={treeLibrary.library.id}
            ref={drag}
            data-testid={`library-item-${treeLibrary.library.id}`}
        >
            {localizedTranslation(treeLibrary.library.label, lang)}
            {!readOnly && (
                <AddBtn icon circular basic size="small" onClick={_handleAdd} aria-label={t('admin.add')}>
                    <Icon name="plus" />
                </AddBtn>
            )}
        </LibraryItemWrapper>
    );
}

export default LibraryItem;
