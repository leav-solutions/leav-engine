// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import React, {useEffect, useState} from 'react';
import {setNavigationActiveTree, setNavigationIsLoading, setNavigationRefetchTreeData} from 'redux/navigation';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {
    getTreeContentQuery,
    IGetTreeContentQuery,
    IGetTreeContentQueryVar,
    IRecordAndChildren
} from '../../graphQL/queries/trees/getTreeContentQuery';
import ColumnNavigation from './ColumnNavigation';
import DetailNavigation from './DetailNavigation';

const Page = styled.div`
    width: auto;
    height: calc(100vh - 6rem);
    display: flex;
    flex-flow: row nowrap;
    overflow-x: scroll;
    overflow-y: hidden;
`;

interface INavigationViewProps {
    tree: string;
}

function NavigationView({tree: treeId}: INavigationViewProps): JSX.Element {
    const navigation = useAppSelector(state => state.navigation);
    const dispatch = useAppDispatch();
    const [tree, setTree] = useState<IRecordAndChildren[]>([]);

    const depth = navigation.path.length + 1; // add 1 to depth to count children

    const {data: dataTreeContent, loading: loadingTreeContent, error: errorTreeContent, refetch} = useQuery<
        IGetTreeContentQuery,
        IGetTreeContentQueryVar
    >(getTreeContentQuery(depth), {
        variables: {
            treeId
        },
        skip: !treeId
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

    useEffect(() => {
        dispatch(setNavigationActiveTree(treeId));
    }, [treeId, dispatch]);

    if (errorTreeContent) {
        return <ErrorDisplay message={errorTreeContent.message} />;
    }

    return (
        <Page>
            <ColumnNavigation treeElements={tree} />
            {navigation.recordDetail && !navigation.isLoading && <DetailNavigation />}
        </Page>
    );
}

export default NavigationView;
