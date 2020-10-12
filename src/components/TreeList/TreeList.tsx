import {useQuery} from '@apollo/client';
import {Spin} from 'antd';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {getTreeListQuery} from '../../queries/trees/getTreeListQuery';
import {ITree} from '../../_types/types';
import TreeItem from '../TreeItem';

const ContainerTreeList = styled.div`
    display: grid;
    grid-gap: 16px;
    justify-content: space-around;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    margin: 1rem;
    width: 100vw;
`;

function TreeList(): JSX.Element {
    const [treeList, setTreeList] = useState<ITree[]>([]);

    const {data, loading, error} = useQuery(getTreeListQuery);

    useEffect(() => {
        if (!loading && data) {
            console.log(data?.trees?.list);
            setTreeList(data?.trees?.list);
        }
    }, [loading, data]);

    if (loading) {
        return <Spin />;
    }

    if (error) {
        return <span>error</span>;
    }

    return (
        <ContainerTreeList>
            {treeList.map(tree => (
                <TreeItem key={tree.id} tree={tree} />
            ))}
        </ContainerTreeList>
    );
}

export default TreeList;
