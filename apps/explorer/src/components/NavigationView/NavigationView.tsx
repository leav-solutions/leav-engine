// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {setNavigationIsLoading, setNavigationRefetchTreeData} from 'redux/navigation';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled from 'styled-components';
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
    const navigation = useAppSelector(state => state.navigation);
    const dispatch = useAppDispatch();
    const [tree, setTree] = useState<IRecordAndChildren[]>([]);
    const {treeId} = useParams<INavigationParams>();

    const depth = navigation.path.length + 1; // add 1 to depth to count children

    const {data: dataTreeContent, loading: loadingTreeContent, error: errorTreeContent, refetch} = useQuery<
        IGetTreeContentQuery,
        IGetTreeContentQueryVar
    >(getTreeContentQuery(depth), {
        variables: {
            treeId
        }
    });

    useEffect(() => {
        if (navigation.refetchTreeData) {
            refetch();
            dispatch(setNavigationRefetchTreeData(false));
        }
    }, [navigation.refetchTreeData, refetch, dispatch]);

    useEffect(() => {
        if (!loadingTreeContent && dataTreeContent) {
            setTree(dataTreeContent.treeContent);
        }
        dispatch(setNavigationIsLoading(loadingTreeContent));
    }, [dataTreeContent, loadingTreeContent, dispatch]);

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
