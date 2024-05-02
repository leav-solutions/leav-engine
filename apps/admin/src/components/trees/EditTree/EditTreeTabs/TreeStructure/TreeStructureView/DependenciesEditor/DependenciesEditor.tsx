// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useDrop} from 'react-dnd';
import {useTranslation} from 'react-i18next';
import {Header} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_TREES_trees_list} from '_gqlTypes/GET_TREES';
import {IDndDropResult, IDndLibraryItem, LIBRARY_DND_TYPE, ROOT_ID} from '../../_types';
import DependenciesLibraryItem from './DependenciesLibraryItem';

interface IDependenciesEditorProps {
    tree: GET_TREES_trees_list;
    readOnly: boolean;
    onMove: (libraryId: string, parentFrom: string, parentTo: string) => void;
}

const TreeRoot = styled.div<{isOver: boolean}>`
    background: ${props => (props.isOver ? '#f5f5f5' : '#FFF')};
    border: 2px dashed #ccc;
    border-radius: 0.25rem;
    padding: 1rem;
    margin: 1rem 0;
`;

const NoRootMessageWrapper = styled.div`
    color: #ccc;
    font-weight: bold;
    margin: 3rem auto;
    text-align: center;
`;

function DependenciesEditor({tree, onMove, readOnly}: IDependenciesEditorProps): JSX.Element {
    const {t} = useTranslation();
    const [{isOver}, drop] = useDrop<IDndLibraryItem, IDndDropResult, {isOver: boolean}>({
        accept: [LIBRARY_DND_TYPE],
        canDrop: () => !readOnly,
        drop: (item, monitor) => {
            const isOverCurrent = monitor.isOver({shallow: true});

            if (!isOverCurrent) {
                return;
            }

            return {id: ROOT_ID};
        },
        collect: monitor => ({
            isOver: monitor.isOver({shallow: true})
        })
    });

    const rootLibraries = tree.libraries.filter(treeLibrary => treeLibrary.settings.allowedAtRoot);

    return (
        <TreeRoot ref={drop} isOver={isOver} data-testid="dependencies-editor-root">
            <Header size="small">{t('trees.root')}</Header>
            {rootLibraries.length ? (
                rootLibraries.map(rootLibrary => (
                    <DependenciesLibraryItem
                        key={rootLibrary.library.id}
                        tree={tree}
                        libraryItem={rootLibrary}
                        parentItemId={ROOT_ID}
                        readOnly={readOnly}
                        onMove={onMove}
                    />
                ))
            ) : (
                <NoRootMessageWrapper>{t('trees.no_root_libraries')}</NoRootMessageWrapper>
            )}
        </TreeRoot>
    );
}

export default DependenciesEditor;
