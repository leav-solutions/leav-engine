import {useQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {
    getTreeContentQuery,
    IGetTreeContentQuery,
    IGetTreeContentQueryVar,
    IRecordAndChildren
} from '../../queries/trees/getTreeContentQuery';
import {setIsLoading} from '../../Reducer/NavigationReducer';
import ColumnNavigation from '../ColumnNavigation';
import DetailNavigation from '../DetailNavigation';

const Page = styled.div`
    width: auto;
    height: calc(100vh - 3rem);
    display: flex;
    flex-flow: row nowrap;
    overflow-y: scroll;
`;

interface INavigationParams {
    treeId: string;
}

function NavigationView(): JSX.Element {
    const [tree, setTree] = useState<IRecordAndChildren[]>([]);

    const {stateNavigation, dispatchNavigation} = useStateNavigation();

    const {treeId} = useParams<INavigationParams>();

    const depth = stateNavigation.path.length + 1; // add 1 to depth to count children

    const {data, loading, error} = useQuery<IGetTreeContentQuery, IGetTreeContentQueryVar>(getTreeContentQuery(depth), {
        variables: {
            treeId
        }
    });

    useEffect(() => {
        if (!loading && data) {
            setTree(data.treeContent);
        }
        dispatchNavigation(setIsLoading(loading));
    }, [data, loading, dispatchNavigation]);

    if (error) {
        return <>error</>;
    }

    return (
        <Page>
            <ColumnNavigation treeElements={tree} />
            <DetailNavigation />
        </Page>
    );
}

export default NavigationView;
