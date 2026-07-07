import {type FunctionComponent} from 'react';
import styled from 'styled-components';
import {Column} from './Column/Column';
import {useTreeExplorerState} from './store/useTreeExplorerState';

const Page = styled.div`
    width: auto;
    height: calc(100vh - 3rem);
    display: flex;
    flex-flow: row nowrap;
    overflow-x: scroll;
    overflow-y: hidden;
`;

export const NavigationView: FunctionComponent = () => {
    const {activeTree, path} = useTreeExplorerState();

    const currentColumnActive = path.length === 0;

    return (
        <Page>
            <Column treeId={activeTree.id} treeElement={null} depth={0} isActive={currentColumnActive} key="__root__" />
            {path.map((pathPart, index) => (
                <Column
                    treeId={activeTree.id}
                    key={pathPart.record.id}
                    treeElement={pathPart}
                    depth={index + 1}
                    isActive={index === path.length - 1}
                />
            ))}
        </Page>
    );
};
