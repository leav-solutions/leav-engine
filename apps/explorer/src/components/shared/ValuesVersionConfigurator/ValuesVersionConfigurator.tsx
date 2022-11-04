// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import useLibraryVersionTrees from 'hooks/useLibraryVersionTrees';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {ITreeNode, IValueVersion} from '_types/types';
import VersionTree from './VersionTree';

const Wrapper = styled.div`
    width: 100%;
    padding: 0.5rem;
    display: flex;
    flex-flow: column nowrap;
    border-right: ${themingVar['@divider-color']} 1px solid;
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
        onVersionChange({...selectedVersion, [treeId]: {id: selectedNode.id, label: String(selectedNode.title)}});
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
