// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {setIsLoading, setRefetchTreeData} from 'Reducer/NavigationReducerActions';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {
    getTreeContentQuery,
    IGetTreeContentQuery,
    IGetTreeContentQueryVar,
    IRecordAndChildren
} from '../../graphQL/queries/trees/getTreeContentQuery';
import ColumnNavigation from '../ColumnNavigation';
import DetailNavigation from '../DetailNavigation';

const Page = styled.div`
    width: auto;
    height: calc(100vh - 6rem);
    display: flex;
    flex-flow: row nowrap;
    overflow-x: scroll;
    overflow-y: hidden;
`;

interface INavigationParams {
    treeId: string;
}

function NavigationView(): JSX.Element {
    const [tree, setTree] = useState<IRecordAndChildren[]>([]);
    const {stateNavigation, dispatchNavigation} = useStateNavigation();
    const {treeId} = useParams<INavigationParams>();

    const depth = stateNavigation.path.length + 1; // add 1 to depth to count children

    const {data: dataTreeContent, loading: loadingTreeContent, error: errorTreeContent, refetch} = useQuery<
        IGetTreeContentQuery,
        IGetTreeContentQueryVar
    >(getTreeContentQuery(depth), {
        variables: {
            treeId
        }
    });

    useEffect(() => {
        if (stateNavigation.refetchTreeData) {
            refetch();
            dispatchNavigation(setRefetchTreeData(false));
        }
    }, [stateNavigation.refetchTreeData, refetch, dispatchNavigation]);

    useEffect(() => {
        if (!loadingTreeContent && dataTreeContent) {
            setTree(dataTreeContent.treeContent);
        }
        dispatchNavigation(setIsLoading(loadingTreeContent));
    }, [dataTreeContent, loadingTreeContent, dispatchNavigation]);

    if (errorTreeContent) {
        return <>error</>;
    }

    return (
        <div>
            <Page>
                <ColumnNavigation treeElements={tree} />
                <DetailNavigation />
            </Page>
        </div>
    );
}

export default NavigationView;
