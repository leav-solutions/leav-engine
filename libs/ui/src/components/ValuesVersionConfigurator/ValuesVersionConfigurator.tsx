// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';
import {themeVars} from '../../antdTheme';
import useLibraryVersionTrees from '../../hooks/useLibraryVersionTrees';
import {ITreeNode} from '../../types/trees';
import {IValueVersion} from '../../types/values';
import {ErrorDisplay} from '../ErrorDisplay';
import {Loading} from '../Loading';
import VersionTree from './VersionTree';

const Wrapper = styled.div`
    width: 100%;
    padding: 0.5rem;
    display: flex;
    flex-flow: column nowrap;
    border-right: ${themeVars.borderLightColor} 1px solid;
    overflow-y: auto;
`;

interface IValuesVersionConfiguratorProps {
    libraryId: string;
    selectedVersion: IValueVersion;
    readOnly?: boolean;
    onVersionChange: (version: IValueVersion) => void;
}

function ValuesVersionConfigurator({
    libraryId,
    selectedVersion,
    readOnly = false,
    onVersionChange
}: IValuesVersionConfiguratorProps): JSX.Element {
    const {loading, error, trees} = useLibraryVersionTrees(libraryId);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const _handleNodeSelection = (treeId: string) => (selectedNode: ITreeNode) => {
        onVersionChange({
            ...selectedVersion,
            [treeId]: selectedNode ? {id: selectedNode.id ?? null, label: String(selectedNode.title)} : null
        });
    };

    return (
        <Wrapper>
            {trees.map(tree => (
                <VersionTree
                    key={tree.id}
                    tree={tree}
                    selectedNode={{
                        id: selectedVersion?.[tree.id]?.id,
                        title: selectedVersion?.[tree.id]?.label,
                        key: selectedVersion?.[tree.id]?.id,
                        children: []
                    }}
                    onNodeChange={_handleNodeSelection(tree.id)}
                    readOnly={readOnly}
                />
            ))}
        </Wrapper>
    );
}

export default ValuesVersionConfigurator;
