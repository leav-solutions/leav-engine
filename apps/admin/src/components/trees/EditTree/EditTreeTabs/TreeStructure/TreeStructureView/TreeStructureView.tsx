// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IKeyValue} from '@leav/utils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header, Loader} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_TREES_trees_list} from '_gqlTypes/GET_TREES';
import {SAVE_TREE_saveTree_libraries_settings} from '_gqlTypes/SAVE_TREE';
import {ALLOW_ALL_ID, ROOT_ID} from '../_types';
import DependenciesEditor from './DependenciesEditor';
import LibraryItem from './LibraryItem';

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: 'libraries deps';
    gap: 1rem;
    height: 100%;
`;

const Libraries = styled.div`
    grid-area: libraries;
    overflow: auto;
    width: 250px;
`;

const Dependencies = styled.div`
    border-left: 1px solid #ccc;
    padding-left: 1rem;
    grid-area: deps;
    overflow: auto;
    position: relative;
`;

interface ITreeStructureViewProps {
    tree: GET_TREES_trees_list;
    readOnly: boolean;
    onChange: (dependencies: IKeyValue<SAVE_TREE_saveTree_libraries_settings>) => void;
    loading: boolean;
}

function TreeStructureView({tree, readOnly, onChange, loading}: ITreeStructureViewProps): JSX.Element {
    const {t} = useTranslation();

    const deps = tree.libraries.reduce((acc, library) => {
        acc[library.library.id] = library.settings;
        return acc;
    }, {} as IKeyValue<SAVE_TREE_saveTree_libraries_settings>);

    const _handleLibraryMove = (libraryId: string, parentFrom: string, parentTo: string) => {
        // Add library to its parent (or root)
        // If removing library, parentTo is null
        if (parentTo === ROOT_ID) {
            deps[libraryId] = {...deps[libraryId], allowedAtRoot: true};
        } else if (parentTo) {
            deps[parentTo] = {
                ...deps[parentTo],
                allowedChildren: [...deps[parentTo].allowedChildren, libraryId].filter(id => id !== ALLOW_ALL_ID)
            };
        }

        // Remove library from its previous parent (or root)
        // If coming from libraries list, parentFrom is null
        if (parentFrom === ROOT_ID) {
            deps[libraryId] = {...deps[libraryId], allowedAtRoot: false};
        } else if (parentFrom) {
            deps[parentFrom] = {
                ...deps[parentFrom],
                allowedChildren: deps[parentFrom].allowedChildren.filter(id => id !== libraryId && id !== ALLOW_ALL_ID)
            };
        }

        onChange(deps);
    };

    return (
        <Wrapper>
            <Libraries data-testid="libraries-list">
                <Header size="small">
                    {t('trees.libraries')}
                    {tree.libraries.map(treeLibrary => (
                        <LibraryItem
                            key={treeLibrary.library.id}
                            treeLibrary={treeLibrary}
                            readOnly={readOnly}
                            onMove={_handleLibraryMove}
                        />
                    ))}
                </Header>
            </Libraries>
            <Dependencies data-testid="dependencies-editor">
                <Header size="small">
                    {t('trees.dependencies')}
                    {loading && <Loader size="tiny" active inline style={{marginLeft: '1rem'}} />}
                </Header>
                <DependenciesEditor tree={tree} readOnly={readOnly} onMove={_handleLibraryMove} />
            </Dependencies>
        </Wrapper>
    );
}

export default TreeStructureView;
